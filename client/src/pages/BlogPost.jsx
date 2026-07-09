import { useParams } from "react-router-dom";
import { blogPosts } from "../data/blogPosts";

export default function BlogPost() {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) return <div style={{ padding: 40 }}>Post not found.</div>;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 20px" }}>
      <h1>{post.title}</h1>
      <small>{post.date}</small>
      <div style={{ whiteSpace: "pre-line", marginTop: 24 }}>{post.content}</div>
    </div>
  );
}
