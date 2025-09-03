-- Crear tabla de grupos
CREATE TABLE IF NOT EXISTS groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT true,
    max_members INTEGER DEFAULT 50,
    image_url TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de miembros de grupos
CREATE TABLE IF NOT EXISTS group_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, profile_id)
);

-- Crear tabla de posts de grupos
CREATE TABLE IF NOT EXISTS group_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de comentarios en posts
CREATE TABLE IF NOT EXISTS group_post_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES group_posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de likes en posts
CREATE TABLE IF NOT EXISTS group_post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES group_posts(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, profile_id)
);

-- Habilitar RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_post_likes ENABLE ROW LEVEL SECURITY;

-- Políticas para groups
CREATE POLICY "Groups are viewable by everyone if public" ON groups
    FOR SELECT USING (is_public = true);

CREATE POLICY "Group members can view their groups" ON groups
    FOR SELECT USING (
        id IN (
            SELECT group_id FROM group_members 
            WHERE profile_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid()::uuid)
        )
    );

CREATE POLICY "Users can create groups" ON groups
    FOR INSERT WITH CHECK (
        created_by = (SELECT id FROM profiles WHERE auth_user_id = auth.uid()::uuid)
    );

CREATE POLICY "Group admins can update their groups" ON groups
    FOR UPDATE USING (
        created_by = (SELECT id FROM profiles WHERE auth_user_id = auth.uid()::uuid)
    );

-- Políticas para group_members
CREATE POLICY "Group members are viewable by group members" ON group_members
    FOR SELECT USING (
        group_id IN (
            SELECT group_id FROM group_members 
            WHERE profile_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid()::uuid)
        )
    );

CREATE POLICY "Users can join groups" ON group_members
    FOR INSERT WITH CHECK (
        profile_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid()::uuid)
    );

CREATE POLICY "Users can leave groups" ON group_members
    FOR DELETE USING (
        profile_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid()::uuid)
    );

-- Políticas para group_posts
CREATE POLICY "Group posts are viewable by group members" ON group_posts
    FOR SELECT USING (
        group_id IN (
            SELECT group_id FROM group_members 
            WHERE profile_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid()::uuid)
        )
    );

CREATE POLICY "Group members can create posts" ON group_posts
    FOR INSERT WITH CHECK (
        author_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid()::uuid)
        AND group_id IN (
            SELECT group_id FROM group_members 
            WHERE profile_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid()::uuid)
        )
    );

CREATE POLICY "Authors can update their posts" ON group_posts
    FOR UPDATE USING (
        author_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid()::uuid)
    );

CREATE POLICY "Authors can delete their posts" ON group_posts
    FOR DELETE USING (
        author_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid()::uuid)
    );

-- Políticas para group_post_comments
CREATE POLICY "Comments are viewable by group members" ON group_post_comments
    FOR SELECT USING (
        post_id IN (
            SELECT gp.id FROM group_posts gp
            JOIN group_members gm ON gp.group_id = gm.group_id
            WHERE gm.profile_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid()::uuid)
        )
    );

CREATE POLICY "Group members can create comments" ON group_post_comments
    FOR INSERT WITH CHECK (
        author_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid()::uuid)
        AND post_id IN (
            SELECT gp.id FROM group_posts gp
            JOIN group_members gm ON gp.group_id = gm.group_id
            WHERE gm.profile_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid()::uuid)
        )
    );

CREATE POLICY "Authors can update their comments" ON group_post_comments
    FOR UPDATE USING (
        author_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid()::uuid)
    );

CREATE POLICY "Authors can delete their comments" ON group_post_comments
    FOR DELETE USING (
        author_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid()::uuid)
    );

-- Políticas para group_post_likes
CREATE POLICY "Likes are viewable by group members" ON group_post_likes
    FOR SELECT USING (
        post_id IN (
            SELECT gp.id FROM group_posts gp
            JOIN group_members gm ON gp.group_id = gm.group_id
            WHERE gm.profile_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid()::uuid)
        )
    );

CREATE POLICY "Group members can like posts" ON group_post_likes
    FOR INSERT WITH CHECK (
        profile_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid()::uuid)
        AND post_id IN (
            SELECT gp.id FROM group_posts gp
            JOIN group_members gm ON gp.group_id = gm.group_id
            WHERE gm.profile_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid()::uuid)
        )
    );

CREATE POLICY "Users can unlike posts" ON group_post_likes
    FOR DELETE USING (
        profile_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid()::uuid)
    );

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_profile_id ON group_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_group_posts_group_id ON group_posts(group_id);
CREATE INDEX IF NOT EXISTS idx_group_posts_author_id ON group_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_group_post_comments_post_id ON group_post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_group_post_likes_post_id ON group_post_likes(post_id);
