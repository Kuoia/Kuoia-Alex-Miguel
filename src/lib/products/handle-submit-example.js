// Función handleSubmit lista para copiar/pegar en un componente de Next.js.
// Requiere que tengas disponibles en el scope: supabase, setError, setSuccess, setLoading.

export const handleSubmit = async (event) => {
  event.preventDefault();

  setError("");
  setSuccess("");
  setLoading(true);

  try {
    // 1) Comprobar sesión y obtener usuario con supabase.auth.getUser()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;

    // 2) Validar autenticación antes de subir
    if (!user) {
      throw new Error("Debes iniciar sesión para crear un producto.");
    }

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const price = Number(formData.get("price"));
    const imageFile = formData.get("image"); // <input type="file" name="image" />

    if (!title || !description || Number.isNaN(price)) {
      throw new Error("Completa título, descripción y precio válidos.");
    }

    if (!(imageFile instanceof File) || imageFile.size === 0) {
      throw new Error("Selecciona una imagen válida.");
    }

    // 3) Subida de imagen al bucket "product-images" en ruta `${user.id}/...`
    const fileExt = imageFile.name.split(".").pop() || "jpg";
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // 4) Obtener URL pública o signedUrl
    let imageUrl = null;

    // Si el bucket es público
    const { data: publicUrlData } = supabase.storage.from("product-images").getPublicUrl(filePath);
    imageUrl = publicUrlData?.publicUrl || null;

    // Fallback a signed URL si no hay pública
    if (!imageUrl) {
      const { data: signedData, error: signedError } = await supabase.storage
        .from("product-images")
        .createSignedUrl(filePath, 60 * 60); // 1 hora

      if (signedError) throw signedError;
      imageUrl = signedData?.signedUrl || null;
    }

    if (!imageUrl) {
      throw new Error("No se pudo obtener la URL de la imagen.");
    }

    // 5) Insertar en tabla "products"
    const { error: insertError } = await supabase.from("products").insert({
      title,
      description,
      price,
      image_url: imageUrl,
      user_id: user.id,
    });

    if (insertError) throw insertError;

    // 6) Mensaje de éxito
    setSuccess("Producto creado correctamente.");
    event.currentTarget.reset();
  } catch (error) {
    // 6) Manejo de errores
    setError(error?.message || "Ocurrió un error al crear el producto.");
  } finally {
    setLoading(false);
  }
};
