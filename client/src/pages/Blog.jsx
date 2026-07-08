import { Link } from "react-router-dom";
import { blogPosts } from "../data/blogPosts";

export default function Blog() {
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 20px" }}>
      <h1>Sahel Blog</h1>
      {blogPosts.map((post) => (
        <div key={post.slug} style={{ marginBottom: 32 }}>
          <h2><Link to={`/blog/${post.slug}`}>{post.title}</Link></h2>
          <p>{post.excerpt}</p>
          <small>{post.date}</small>
        </div>
      ))}
    </div>
  );
}
