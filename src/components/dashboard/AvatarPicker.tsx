import { useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

import { UserAvatar } from "@/components/ui/UserAvatar";
import { buttonClasses } from "@/components/ui/Button";
import { apiMessage } from "@/lib/api";
import { useAuthUser } from "@/lib/auth";
import { displayName } from "@/lib/format";
import {
  AVATAR_MAX_MB,
  avatarError,
  useRemoveAvatar,
  useUploadAvatar,
} from "@/lib/profile";
import { cn } from "@/lib/cn";

export function AvatarPicker() {
  const user = useAuthUser();
  const uploadAvatar = useUploadAvatar();
  const removeAvatar = useRemoveAvatar();
  const busy = uploadAvatar.isPending || removeAvatar.isPending;
  const [error, setError] = useState<string | null>(null);

  async function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    // Checked here so an oversized file never leaves the browser.
    const rejection = avatarError(file);
    setError(rejection);
    if (rejection) return;

    try {
      await uploadAvatar.mutateAsync(file);
      toast.success("Photo updated");
    } catch (error) {
      toast.error(apiMessage(error));
    }
  }

  async function onRemove() {
    setError(null);

    try {
      await removeAvatar.mutateAsync();
      toast.success("Photo removed");
    } catch (error) {
      toast.error(apiMessage(error));
    }
  }

  return (
    <div className="mb-6 flex items-center gap-4">
      <UserAvatar
        name={displayName(user.fullname)}
        avatar={user.avatar}
        className="size-16 text-base"
      />
      <div className="flex flex-wrap items-center gap-2">
        <label
          className={cn(
            buttonClasses("outline", "sm"),
            "cursor-pointer",
            busy && "pointer-events-none opacity-60",
          )}
        >
          {uploadAvatar.isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Camera className="size-4" aria-hidden />
          )}
          Change photo
          <input
            type="file"
            accept="image/*"
            onChange={onPick}
            disabled={busy}
            className="sr-only"
          />
        </label>
        {user.avatar && (
          <button
            type="button"
            onClick={onRemove}
            disabled={busy}
            className={cn(buttonClasses("ghost", "sm"), "disabled:opacity-60")}
          >
            Remove
          </button>
        )}
        {error ? (
          <p role="alert" className="w-full text-xs text-rose-500">
            {error}
          </p>
        ) : (
          <p className="w-full text-xs text-muted">
            JPG, PNG or WebP, up to {AVATAR_MAX_MB}MB.
          </p>
        )}
      </div>
    </div>
  );
}
