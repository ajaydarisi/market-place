"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadAvatar, validateImageFile, deleteAvatar } from "@/lib/upload";
import { useToast } from "@/hooks/use-toast";

const sizeClasses = {
  sm: "h-10 w-10",
  md: "h-16 w-16",
  lg: "h-24 w-24",
} as const;

const iconSizeClasses = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
} as const;

export interface AvatarUploadProps {
  currentImageUrl?: string | null;
  initials: string;
  userId: string;
  onUploadComplete: (url: string) => void;
  onRemove?: () => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AvatarUpload({
  currentImageUrl,
  initials,
  userId,
  onUploadComplete,
  onRemove,
  disabled = false,
  size = "md",
  className,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const displayUrl = previewUrl || currentImageUrl;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";

    const validationError = validateImageFile(file);
    if (validationError) {
      toast({
        title: "Invalid file",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsUploading(true);

    try {
      const { publicUrl } = await uploadAvatar(userId, file);
      onUploadComplete(publicUrl);
      toast({
        title: "Photo uploaded",
        description: "Your profile photo has been updated.",
      });
    } catch (error) {
      setPreviewUrl(null);
      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "Failed to upload photo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(objectUrl);
    }
  };

  const handleRemove = async () => {
    if (!onRemove) return;
    setIsUploading(true);
    try {
      await deleteAvatar(userId);
      setPreviewUrl(null);
      onRemove();
      toast({
        title: "Photo removed",
        description: "Your profile photo has been removed.",
      });
    } catch {
      toast({
        title: "Failed to remove photo",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className={cn(
        "relative inline-flex flex-col items-center gap-2",
        className
      )}
    >
      <div className="relative group">
        <Avatar
          className={cn(
            sizeClasses[size],
            "border-2 border-primary/20",
            !disabled && "cursor-pointer"
          )}
          aria-label={
            disabled ? "User avatar" : "Click to change profile photo"
          }
          onClick={() =>
            !disabled && !isUploading && fileInputRef.current?.click()
          }
        >
          {displayUrl && <AvatarImage src={displayUrl} alt="Profile photo" />}
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        {!disabled && !isUploading && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-full bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="Upload profile photo"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                fileInputRef.current?.click();
              }
            }}
          >
            <Camera className={cn(iconSizeClasses[size], "text-primary")} />
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/60">
            <Loader2
              className={cn(
                iconSizeClasses[size],
                "animate-spin text-primary"
              )}
            />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
        aria-label="Choose profile photo file"
      />

      {!disabled && displayUrl && !isUploading && onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="Remove profile photo"
          className="text-muted-foreground hover:text-destructive"
          onClick={handleRemove}
        >
          <Trash2 className="mr-1 h-3 w-3" />
          Remove
        </Button>
      )}
    </div>
  );
}
