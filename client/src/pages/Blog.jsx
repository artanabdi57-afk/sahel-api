import { Link } from "react-router-dom";
import { blogPosts } from "../data/blogPosts";

export default function Blog() {
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
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
          Sahel Blog
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Guides for shop owners in Somalia
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Practical advice on running and growing your shop.
        </p>

        <div className="mt-10 space-y-4">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="block rounded-lg border border-slate-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-sm"
            >
              <h2 className="text-xl font-bold text-slate-950">{post.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{post.excerpt}</p>
              <p className="mt-3 text-xs font-medium text-slate-400">{post.date}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
