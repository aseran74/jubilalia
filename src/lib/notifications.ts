import { supabase } from './supabase';

/**
 * Crea una notificación para un usuario
 */
export const createNotification = async (
  userId: string,
  type: 'activity_nearby' | 'new_message' | 'group_post' | 'friend_request' | 'friend_accepted' | 'group_invitation',
  title: string,
  message: string,
  linkUrl?: string,
  metadata?: Record<string, any>
) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        link_url: linkUrl || null,
        metadata: metadata || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createNotification:', error);
    return null;
  }
};

/**
 * Crea notificaciones para múltiples usuarios
 */
export const createBulkNotifications = async (
  userIds: string[],
  type: 'activity_nearby' | 'new_message' | 'group_post' | 'friend_request' | 'friend_accepted' | 'group_invitation',
  title: string,
  message: string,
  linkUrl?: string,
  metadata?: Record<string, any>
) => {
  try {
    const notifications = userIds.map(userId => ({
      user_id: userId,
      type,
      title,
      message,
      link_url: linkUrl || null,
      metadata: metadata || null
    }));

    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();

    if (error) {
      console.error('Error creating bulk notifications:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in createBulkNotifications:', error);
    return [];
  }
};

/**
 * Notifica sobre una nueva actividad cercana
 */
export const notifyActivityNearby = async (
  userId: string,
  activityId: string,
  activityTitle: string,
  distance?: number
) => {
  return createNotification(
    userId,
    'activity_nearby',
    'Nueva actividad cerca de ti',
    distance 
      ? `${activityTitle} está a ${Math.round(distance)} km de distancia`
      : `Nueva actividad: ${activityTitle}`,
    `/dashboard/activities/${activityId}`,
    { activity_id: activityId, distance }
  );
};

/**
 * Notifica sobre un nuevo mensaje
 */
export const notifyNewMessage = async (
  userId: string,
  senderId: string,
  senderName: string,
  messagePreview: string,
  conversationId?: string
) => {
  return createNotification(
    userId,
    'new_message',
    `Nuevo mensaje de ${senderName}`,
    messagePreview.length > 50 ? messagePreview.substring(0, 50) + '...' : messagePreview,
    conversationId ? `/dashboard/messages/${conversationId}` : `/dashboard/messages`,
    { sender_id: senderId, conversation_id: conversationId }
  );
};

/**
 * Notifica sobre un nuevo post en un grupo
 */
export const notifyGroupPost = async (
  userId: string,
  groupId: string,
  groupName: string,
  postId: string,
  postTitle: string,
  authorName: string
) => {
  return createNotification(
    userId,
    'group_post',
    `Nuevo post en ${groupName}`,
    `${authorName} publicó: ${postTitle}`,
    `/dashboard/groups/${groupId}/posts/${postId}`,
    { group_id: groupId, post_id: postId, author_name: authorName }
  );
};

/**
 * Notifica sobre una solicitud de amistad
 */
export const notifyFriendRequest = async (
  userId: string,
  requesterId: string,
  requesterName: string
) => {
  return createNotification(
    userId,
    'friend_request',
    'Nueva solicitud de amistad',
    `${requesterName} quiere ser tu amigo`,
    `/dashboard/users/${requesterId}`,
    { requester_id: requesterId }
  );
};

/**
 * Notifica sobre una amistad aceptada
 */
export const notifyFriendAccepted = async (
  userId: string,
  friendId: string,
  friendName: string
) => {
  return createNotification(
    userId,
    'friend_accepted',
    'Solicitud de amistad aceptada',
    `${friendName} aceptó tu solicitud de amistad`,
    `/dashboard/users/${friendId}`,
    { friend_id: friendId }
  );
};

/**
 * Notifica a todos los miembros de un grupo sobre un nuevo post
 */
export const notifyGroupMembersAboutPost = async (
  groupId: string,
  postId: string,
  postTitle: string,
  authorName: string,
  authorId: string
) => {
  try {
    // Obtener todos los miembros del grupo excepto el autor
    const { data: members, error } = await supabase
      .from('group_members')
      .select('profile_id')
      .eq('group_id', groupId)
      .neq('profile_id', authorId);

    if (error || !members || members.length === 0) {
      console.error('Error fetching group members:', error);
      return [];
    }

    // Obtener el nombre del grupo
    const { data: group } = await supabase
      .from('groups')
      .select('name')
      .eq('id', groupId)
      .single();

    const groupName = group?.name || 'el grupo';

    // Crear notificaciones para todos los miembros
    const userIds = members.map(m => m.profile_id);
    return createBulkNotifications(
      userIds,
      'group_post',
      `Nuevo post en ${groupName}`,
      `${authorName} publicó: ${postTitle}`,
      `/dashboard/groups/${groupId}/posts/${postId}`,
      { group_id: groupId, post_id: postId, author_name: authorName }
    );
  } catch (error) {
    console.error('Error in notifyGroupMembersAboutPost:', error);
    return [];
  }
};
