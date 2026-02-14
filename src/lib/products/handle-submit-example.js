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

    // 3 y 4) Si hay imagen, subir al bucket "product-images"
    // usando la ruta `${user.id}/${crypto.randomUUID()}-${file.name}`.
    let imageUrl = null;

    if (imageFile instanceof File && imageFile.size > 0) {
      const filePath = `${user.id}/${crypto.randomUUID()}-${imageFile.name}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from("product-images").getPublicUrl(filePath);
      imageUrl = publicUrlData?.publicUrl || null;

      if (!imageUrl) {
        const { data: signedData, error: signedError } = await supabase.storage
          .from("product-images")
          .createSignedUrl(filePath, 60 * 60);

        if (signedError) throw signedError;
        imageUrl = signedData?.signedUrl || null;
      }

      if (!imageUrl) {
        throw new Error("No se pudo obtener la URL de la imagen.");
      }
    }

    // 5) Insertar en tabla "products" con user_id obligatorio
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
