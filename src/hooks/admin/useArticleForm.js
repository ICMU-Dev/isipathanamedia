import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { ICMU_AUTHOR_NAME, isInstitutionAuthor } from "../../utils/authorUtils";

const ARTICLE_LIMITS = {
  title: 100,
  category: 40,
  tag: 24,
  tags: 8,
  content: 30000,
};

export const useArticleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { news, addNews, updateNews, uploadImage, compressImage, fetchNews } =
    useData();
  const { user } = useAuth();

  const userRole = user?.role?.toLowerCase();
  const isSuperAdmin =
    userRole === "super_admin" ||
    userRole === "super-admin" ||
    userRole === "superadmin";
  const isAdmin = isSuperAdmin || userRole === "admin";

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    content: "",
    image: "",
    author: "",
    submitted_by: "",
    type: "article",
    tags: [],
    visibility: "private", // Default to private for drafts
  });

  const [initialFormData, setInitialFormData] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (initialFormData) {
      setIsDirty(JSON.stringify(formData) !== JSON.stringify(initialFormData));
    }
  }, [formData, initialFormData]);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [mediaLibraryTarget, setMediaLibraryTarget] = useState("cover");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const canEditMetadata = !id || formData.submitted_by === user?.id || isAdmin;

  // Cropper State
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class:
            "rounded-2xl max-w-full my-4 border border-theme-base shadow-lg",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-theme-accent underline hover:text-[#00cc00]",
        },
      }),
    ],
    content: formData.content,
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[520px] outline-none px-4 sm:px-8 py-6 text-sm sm:text-base custom-scrollbar",
      },
    },
    onUpdate: ({ editor }) => {
      setFormData((prev) => ({ ...prev, content: editor.getHTML() }));
      if (errors.content) setErrors((prev) => ({ ...prev, content: null }));
    },
  });

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  useEffect(() => {
    if (id && news.length > 0) {
      const article = news.find((n) => n.id.toString() === id);
      if (article) {
        const authorMatch = article.submitted_by === user?.id;

        if (!isAdmin && !authorMatch) {
          toast.error("You are not authorized to edit this article.");
          navigate(-1);
          return;
        }

        const loadedData = {
          title: article.title || "",
          category: article.category || "",
          date: article.date || new Date().toISOString().split("T")[0],
          content: article.content || "",
          image: article.image || "",
          tags: article.tags || [],
          author: article.author || "",
          submitted_by: article.submitted_by || "",
          type: article.type || "article",
          status: article.status || "draft",
          visibility: article.visibility || "public",
        };
        setIsAnonymous(isInstitutionAuthor(article.author));
        setFormData(loadedData);
        setInitialFormData(loadedData);
        if (editor && !editor.isDestroyed && article.content && editor.getHTML() !== article.content) {
          editor.commands.setContent(article.content);
        }
      }
    } else if (!id && !initialFormData) {
        setInitialFormData(formData);
    }
  }, [id, news, editor, isAdmin, user, navigate]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setImageToCrop(localUrl);
    setCropModalOpen(true);
    e.target.value = null;
  };

  const handleCropComplete = async (croppedFile) => {
    setCropModalOpen(false);
    setImageToCrop(null);
    setUploading(true);

    try {
      const compressed = await compressImage(croppedFile, 4, 0.8);
      if (compressed.size > 5 * 1024 * 1024) {
        toast.error("Image is too large (max 5MB after compression)");
        setUploading(false);
        return;
      }
      const publicUrl = await uploadImage(compressed, "news_images", "articles");
      if (publicUrl) {
        setFormData((prev) => ({ ...prev, image: publicUrl }));
        if (errors.image) setErrors((prev) => ({ ...prev, image: null }));
        toast.success("Cover image uploaded!");
      }
    } catch (err) {
      toast.error("Upload failed");
    }
    setUploading(false);
  };

  const openMediaLibrary = (target) => {
    setMediaLibraryTarget(target);
    setMediaLibraryOpen(true);
  };

  const handleMediaSelect = (url) => {
    if (mediaLibraryTarget === "cover") {
      setFormData((prev) => ({ ...prev, image: url }));
      if (errors.image) setErrors((prev) => ({ ...prev, image: null }));
    } else if (mediaLibraryTarget === "inline" && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
    setMediaLibraryOpen(false);
  };

  const validateStep = (step) => {
    const newErrors = {};
    let isValid = true;

    if (step === 1) {
      if (!formData.title.trim()) {
        newErrors.title = "Title is required";
        isValid = false;
      }
      if (formData.title.length > ARTICLE_LIMITS.title) {
        newErrors.title = `Title must be ${ARTICLE_LIMITS.title} characters or fewer`;
        isValid = false;
      }
      if (!formData.category.trim()) {
        newErrors.category = "Category is required";
        isValid = false;
      } else if (formData.category.trim().length > ARTICLE_LIMITS.category) {
        newErrors.category = `Category must be ${ARTICLE_LIMITS.category} characters or fewer`;
        isValid = false;
      }
      if (!formData.date || Number.isNaN(new Date(formData.date).getTime())) {
        newErrors.date = "A valid date is required";
        isValid = false;
      }
      if ((formData.tags || []).length > ARTICLE_LIMITS.tags) {
        newErrors.tags = `Use up to ${ARTICLE_LIMITS.tags} tags`;
        isValid = false;
      } else if ((formData.tags || []).some((tag) => tag.length > ARTICLE_LIMITS.tag)) {
        newErrors.tags = `Each tag must be ${ARTICLE_LIMITS.tag} characters or fewer`;
        isValid = false;
      }
    } else if (step === 2) {
      const plainText = editor
        ? editor.getText()
        : formData.content.replace(/<[^>]*>?/gm, "");
      if (!plainText.trim() || plainText.length < 10) {
        newErrors.content = "Content is too short";
        isValid = false;
      } else if (plainText.length > ARTICLE_LIMITS.content) {
        newErrors.content = `Content must be ${ARTICLE_LIMITS.content} characters or fewer`;
        isValid = false;
      }
    } else if (step === 3) {
      if (!formData.image) {
        newErrors.image = "Cover image is required";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    } else {
      toast.error("Please fill in required fields.");
    }
  };

  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSave = async (targetStatus) => {
    if (![1, 2, 3].every((step) => validateStep(step))) {
      toast.error("Please fix the highlighted fields before saving.");
      return;
    }

    setSaving(true);
    try {
      if (!isAdmin && targetStatus === "published") {
        targetStatus = "pending";
      }

      const payload = {
        ...formData,
        type: formData.type || "article",
        status: targetStatus,
      };
      
      // If saving as draft, force visibility to private to prevent leaks
      if (targetStatus === "draft") {
          payload.visibility = "private";
      } else if (targetStatus === "pending") {
          // Defaults to public when submitted for review if it was private (draft)
          if (formData.visibility === "private") {
              payload.visibility = "public";
          }
      }

      if (!id) {
        payload.submitted_by = user?.id; // UUID
        payload.visibility = payload.visibility || "public";
        payload.author = isAnonymous
          ? "Isipathana College Media Unit"
          : user?.name || user?.username || "Admin";
      } else {
        // preserve original submitter and author
        const originalArticle = news.find(n => n.id.toString() === id);
        if (originalArticle) {
            payload.submitted_by = originalArticle.submitted_by;
            payload.author = isAnonymous
              ? ICMU_AUTHOR_NAME
              : originalArticle.author || formData.author;
        }
      }

      if (id) {
        await updateNews(id, payload);
      } else {
        await addNews(payload);
      }
      toast.success(
        targetStatus === "published"
          ? "Article published!"
          : targetStatus === "draft"
            ? "Draft saved!"
            : "Submitted for review!",
      );
      navigate(-1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save article");
    } finally {
      setSaving(false);
    }
  };

  return {
    id,
    navigate,
    user,
    isAdmin,
    currentStep,
    totalSteps,
    formData,
    setFormData,
    isDirty,
    uploading,
    saving,
    errors,
    setErrors,
    mediaLibraryOpen,
    setMediaLibraryOpen,
    isAnonymous,
    setIsAnonymous,
    canEditMetadata,
    cropModalOpen,
    setCropModalOpen,
    imageToCrop,
    setImageToCrop,
    editor,
    handleFileUpload,
    handleCropComplete,
    openMediaLibrary,
    handleMediaSelect,
    handleNext,
    handleBack,
    handleSave,
    uploadImage,
    setCurrentStep,
  };
};
