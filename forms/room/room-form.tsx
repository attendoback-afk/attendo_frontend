"use client";

import Link from "next/link";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import type { InferType } from "yup";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { roomsApi } from "@/lib/api/services";
import { roomFormSchema } from "@/validators/room-form-schema";
import type { RoomRecord } from "@/lib/api/types";

type RoomFormData = InferType<typeof roomFormSchema>;

const defaultValues: RoomFormData = {
  name: "",
};

export function RoomForm({
  cancelHref,
  room,
}: {
  cancelHref?: string;
  room?: RoomRecord;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = Boolean(room);

  const methods = useForm<RoomFormData>({
    resolver: yupResolver(roomFormSchema),
    defaultValues: room
      ? {
          name: room.name,
        }
      : defaultValues,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const handleSubmit = methods.handleSubmit(async (values) => {
    try {
      methods.clearErrors();

      const payload = {
        name: values.name.trim(),
      };

      if (isEditing && room) {
        await roomsApi.update(room.id, payload);
        toast({
          title: "Room updated",
          description: "Room details have been updated successfully.",
        });
        router.push(cancelHref || "/rooms");
        router.refresh();
      } else {
        await roomsApi.create(payload);
        methods.reset(defaultValues);
        toast({
          title: "Room created",
          description: "New room has been added successfully.",
        });
        router.push(cancelHref || "/rooms");
        router.refresh();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  return (
    <Form {...methods}>
      <form onSubmit={handleSubmit} className="dashboard-page" noValidate>
        <Card className="dashboard-panel gap-0 py-0">
          <CardContent className="p-6">
            <div className="mb-4">
              <h2 className="dashboard-section-title">
                {isEditing ? "Edit Room" : "Room Information"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {isEditing
                  ? "Update the room details below."
                  : "Enter the room details to create a new room."}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="room-name" className="dashboard-field-label">
                  Room Name
                </Label>
                <Input
                  id="room-name"
                  placeholder="e.g. Room 101"
                  className="rounded-lg"
                  aria-invalid={Boolean(methods.formState.errors.name)}
                  disabled={methods.formState.isSubmitting}
                  {...methods.register("name")}
                />
                {methods.formState.errors.name?.message ? (
                  <p className="text-sm text-destructive">
                    {methods.formState.errors.name.message}
                  </p>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          {cancelHref ? (
            <Button asChild variant="outline" className="rounded-lg" type="button">
              <Link href={cancelHref}>Cancel</Link>
            </Button>
          ) : null}
          <Button
            className="rounded-lg"
            type="submit"
            disabled={methods.formState.isSubmitting}
          >
            {methods.formState.isSubmitting
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
              ? "Update Room"
              : "Create Room"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
