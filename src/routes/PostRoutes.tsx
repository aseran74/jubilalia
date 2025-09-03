import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PostList from '../components/posts/PostList';
import PostForm from '../components/posts/PostForm';
import PostDetail from '../components/posts/PostDetail';
import PostEdit from '../components/posts/PostEdit';

const PostRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<PostList />} />
      <Route path="/create" element={<PostForm />} />
      <Route path="/:id" element={<PostDetail />} />
      <Route path="/:id/edit" element={<PostEdit />} />
    </Routes>
  );
};

export default PostRoutes;

