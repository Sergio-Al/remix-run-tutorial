import {
  useTransition,
  Form,
  useLoaderData,
  redirect,
  ActionFunction,
  useActionData,
} from "remix";
import type { LoaderFunction } from "remix";
import { editPost, getPost } from "~/post";
import invariant from "tiny-invariant";

type PostError = {
  title?: boolean;
  slug?: boolean;
  markdown?: boolean;
};

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.slug, "expected params.slug");
  return getPost(params.slug);
};

let globalSlug: string;

export const action: ActionFunction = async ({ request }) => {
  await new Promise((res) => setTimeout(res, 1000));
  const formData = await request.formData();

  const title = formData.get("title");
  const slug = formData.get("slug");
  const markdown = formData.get("markdown");
  const initialSlug = formData.get("initialSlug");

  const errors: PostError = {};
  if (!title) errors.title = true;
  if (!slug) errors.slug = true;
  if (!markdown) errors.markdown = true;

  if (Object.keys(errors).length) {
    return errors;
  }

  invariant(typeof title === "string");
  invariant(typeof slug === "string");
  invariant(typeof markdown === "string");
  invariant(typeof initialSlug === "string");

  await editPost({ title, slug, markdown }, initialSlug);

  return redirect("/admin");
};

export default function EditSlug() {
  const post = useLoaderData();
  const errors = useActionData();
  const transition = useTransition();
  globalSlug = post.slug;
  return (
    <Form method="post">
      <p>
        <label>
          Post Title: {errors?.title && <em>Title is required</em>}
          <input type="text" name="title" defaultValue={post.title} />
        </label>
      </p>
      <p>
        <label>
          Current Slug
          <input
            type="text"
            name="initialSlug"
            value={post.slug}
            readOnly
          />
        </label>
      </p>
      <p>
        <label>
          Post Slug: {errors?.slug && <em>Slug is required</em>}
          <input type="text" name="slug" defaultValue={post.slug} />
        </label>
      </p>
      <p>
        <label htmlFor="markdown">Markdown</label>
        {errors?.markdown && <em>Markdown is required</em>}
        <br />
        <textarea
          id="markdown"
          rows={20}
          name="markdown"
          defaultValue={post.plainBody}
        />
      </p>
      <p>
        <button type="submit">
          {transition.submission ? "Editing..." : "Edit Post"}
        </button>
      </p>
    </Form>
  );
}
