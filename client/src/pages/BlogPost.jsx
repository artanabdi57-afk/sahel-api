import { Link, useParams } from "react-router-dom";
import { blogPosts } from "../data/blogPosts";

function renderContent(content) {
  return content
    .trim()
    .split("\n")
    .map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return null;
      if (trimmed.startsWith("### ")) {
        return (
          <h3 key={i} className="mt-6 text-lg font-bold text-slate-950">
            {trimmed.replace("### ", "")}
          </h3>
        );
      }
      if (trimmed.startsWith("## ")) {
        return (
          <h2 key={i} className="mt-8 text-xl font-bold text-slate-950">
            {trimmed.replace("## ", "")}
          </h2>
        );
      }
      return (
        <p key={i} className="mt-3 leading-relaxed text-slate-700">
          {trimmed}
        </p>
      );
    });
}

export default function BlogPost() {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-950">Post not found</p>
          <Link to="/blog" className="mt-2 inline-block text-sm text-blue-600">
            Back to blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-5 lg:px-8">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-lg font-black text-white">
            S
          </div>
          <Link to="/welcome" className="text-lg font-bold text-slate-950">
            Sahel
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
        <Link to="/blog" className="text-sm font-medium text-blue-600">
          ← Back to blog
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-slate-950">{post.title}</h1>
        <p className="mt-2 text-xs font-medium text-slate-400">{post.date}</p>

        <article className="mt-8 rounded-lg border border-slate-200 bg-white p-8">
          {renderContent(post.content)}
        </article>
      </main>
    </div>
  );
}
