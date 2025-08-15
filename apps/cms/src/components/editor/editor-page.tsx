"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { buttonVariants } from "@marble/ui/components/button";
import {
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@marble/ui/components/sidebar";
import { toast } from "@marble/ui/components/sonner";
import { cn } from "@marble/ui/lib/utils";
import { ArrowElbowUpLeft, SidebarSimple } from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { JSONContent } from "novel";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Editor } from "@/components/editor/editor";
import { EditorSidebar } from "@/components/editor/editor-sidebar";
import { HiddenScrollbar } from "@/components/editor/hidden-scrollbar";
import { type PostValues, postSchema } from "@/lib/validations/post";
import { useUnsavedChanges } from "@/providers/unsaved-changes";
import { sanitizeHtml } from "@/utils/editor";
import { generateSlug } from "@/utils/string";
import { TextareaAutosize } from "./textarea-autosize";

interface EditorPageProps {
  initialData: PostValues;
  id?: string;
}

function EditorPage({ initialData, id }: EditorPageProps) {
  const router = useRouter();
  const params = useParams<{ workspace: string }>();
  const { open, isMobile } = useSidebar();
  const formRef = useRef<HTMLFormElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const { setHasUnsavedChanges } = useUnsavedChanges();
  const initialDataRef = useRef<PostValues>(initialData);
  const queryClient = useQueryClient();

  const isUpdateMode = !!id;

  const form = useForm<PostValues>({
    resolver: zodResolver(postSchema),
    defaultValues: { ...initialData },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    control,
    formState: { errors },
  } = form;

  const { mutate: createPost, isPending: isCreating } = useMutation({
    mutationFn: (values: PostValues) =>
      fetch("/api/posts", {
        method: "POST",
        body: JSON.stringify(values),
      }).then((res) => {
        if (!res.ok) {
          throw new Error("Failed to create post");
        }
        return res.json();
      }),
    onSuccess: (data) => {
      toast.success("Post created");
      router.push(`/${params.workspace}/editor/p/${data.id}`);
      queryClient.invalidateQueries({
        queryKey: ["posts", params.workspace],
      });
      setHasUnsavedChanges(false);
    },
    onError: () => {
      toast.error("Something went wrong.");
    },
  });

  const { mutate: updatePost, isPending: isUpdating } = useMutation({
    mutationFn: (values: PostValues) =>
      fetch(`/api/posts/${id}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      }),
    onSuccess: async (_data, variables) => {
      toast.success("Post updated");
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["posts", params.workspace],
        }),
        queryClient.invalidateQueries({ queryKey: ["post", id] }),
      ]);
      form.reset({ ...variables });
      setHasUnsavedChanges(false);
    },
    onError: () => {
      toast.error("Something went wrong.");
    },
  });

  useEffect(() => {
    // Reset form if initialData changes (e.g., navigating between posts or from new to edit)
    form.reset({ ...initialData });
    initialDataRef.current = initialData;
  }, [initialData, form.reset]);

  useEffect(() => {
    const subscription = watch((currentValues) => {
      const initial = initialDataRef.current;
      // Ensure all relevant fields are stringified for comparison
      const hasChanged =
        JSON.stringify({
          ...currentValues,
          contentJson: currentValues.contentJson
            ? JSON.parse(currentValues.contentJson)
            : {},
        }) !==
        JSON.stringify({
          ...initial,
          contentJson: initial.contentJson
            ? JSON.parse(initial.contentJson)
            : {},
        });
      setHasUnsavedChanges(hasChanged);
    });

    return () => subscription.unsubscribe();
  }, [watch, setHasUnsavedChanges]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // TODO: focus the editor when user hits enter
    }
  };

  const handleEditorChange = (html: string, json: JSONContent) => {
    if (html.length > 0) {
      clearErrors("content");
    }
    setValue("content", sanitizeHtml(html));
    setValue("contentJson", JSON.stringify(json));
  };

  function onSubmit(values: PostValues) {
    if (isUpdateMode && id) {
      updatePost(values);
    } else {
      createPost(values);
    }
  }

  const title = watch("title");

  useEffect(() => {
    if (title && !isUpdateMode) {
      const slug = generateSlug(title);
      setValue("slug", slug);
      clearErrors("slug");
    } else if (
      title &&
      isUpdateMode &&
      initialDataRef.current &&
      initialDataRef.current.title !== title
    ) {
      const slug = generateSlug(title);
      setValue("slug", slug);
      clearErrors("slug");
    }
  }, [title, setValue, clearErrors, isUpdateMode]);

  return (
    <>
      <SidebarInset className="bg-sidebar/70 rounded-xl shadow-sm border min-h-[calc(100vh-1rem)] h-[calc(100vh-1rem)]">
        <header className="sticky top-0 p-3 z-50 flex justify-between">
          <div className="flex gap-4 items-center">
            <Link
              href={`/${params.workspace}/posts`}
              className={cn(buttonVariants({ variant: "ghost" }), "group")}
            >
              <ArrowElbowUpLeft
                weight="regular"
                className="size-6 text-muted-foreground group-hover:text-foreground"
              />
            </Link>
          </div>

          <div>
            <SidebarTrigger
              size="icon"
              className="size-10 text-muted-foreground"
            >
              <SidebarSimple />
            </SidebarTrigger>
          </div>
        </header>
        <section className="mx-auto w-full max-w-3xl flex-1">
          <HiddenScrollbar className="h-[calc(100vh-8rem)]">
            <form
              ref={formRef}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5 rounded-md p-4"
            >
              <div className="flex flex-col">
                <label htmlFor="title" className="sr-only">
                  Enter post your title
                </label>
                <TextareaAutosize
                  id="title"
                  placeholder="Title"
                  {...register("title")}
                  onKeyDown={handleKeyDown}
                  className="mb-2 resize-none scrollbar-hide w-full bg-transparent sm:px-4 text-4xl font-semibold focus:outline-none focus:ring-0"
                />
                {errors.title && (
                  <p className="text-sm px-1 font-medium text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col">
                <Editor
                  value={JSON.parse(watch("contentJson") || "{}")}
                  onChange={handleEditorChange}
                />
                {errors.content && (
                  <p className="text-sm px-1 font-medium text-destructive">
                    {errors.content.message}
                  </p>
                )}
              </div>
            </form>
          </HiddenScrollbar>
        </section>
      </SidebarInset>
      {!isMobile && (
        <div
          className={cn(
            "h-svh transition-[width] ease-linear",
            open ? "w-2" : "w-0",
          )}
        />
      )}
      <EditorSidebar
        errors={errors}
        control={control}
        formRef={formRef}
        watch={watch}
        isSubmitting={isCreating || isUpdating}
        isOpen={showSettings}
        setIsOpen={setShowSettings}
        mode={isUpdateMode ? "update" : "create"}
      />
    </>
  );
}
export default EditorPage;
