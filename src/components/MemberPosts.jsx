import React from 'react';

const posts = [ // This data could be moved to a separate file or fetched from an API in a real application
  { id: 1, author: "John Doe", content: "The retreat last weekend was a spiritual awakening for us all.", date: "2 hrs ago" },
  { id: 2, author: "Sister Mary", content: "New training materials for the junior servers are now available.", date: "5 hrs ago" },
  { id: 3, author: "Mark Smith", content: "Great turnout at the community service project today!", date: "1 day ago" },
];

const MemberPosts = () => {
  return (
    <section className="py-20 bg-black px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-serif text-white mb-12 text-center underline decoration-[#8b4513] underline-offset-8">Community Voice</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {posts.map(post => (
            <div key={post.id} className="bg-[#1a1a1a] p-8 border border-[#3d2b1f] hover:border-[#8b4513] transition-all group">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[#8b4513] font-bold text-xs uppercase tracking-widest">{post.author}</span>
                <span className="text-gray-600 text-[10px]">{post.date}</span>
              </div>
              <p className="text-gray-300 italic">"{post.content}"</p>
              <div className="mt-6 pt-6 border-t border-[#3d2b1f] opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="text-[#d2b48c] text-xs font-bold uppercase">Read More →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MemberPosts;