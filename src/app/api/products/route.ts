import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return NextResponse.json(
      { error: userError.message },
      { status: 500 },
    );
  }

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const formData = await request.formData();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price"));
  const image = formData.get("image");

  if (!title || !description || Number.isNaN(price)) {
    return NextResponse.json(
      { error: "Datos inválidos: title, description y price son obligatorios." },
      { status: 400 },
    );
  }

  let imageUrl: string | null = null;

  if (image instanceof File && image.size > 0) {
    const extension = image.name.includes(".")
      ? image.name.split(".").pop()
      : "bin";
    const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`;
    const fileBuffer = Buffer.from(await image.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, fileBuffer, {
        contentType: image.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 400 });
    }

    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    imageUrl = publicUrlData.publicUrl;
  }

  const { data: product, error: insertError } = await supabase
    .from("products")
    .insert({
      title,
      description,
      price,
      image_url: imageUrl,
      user_id: user.id,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ product }, { status: 201 });
}
