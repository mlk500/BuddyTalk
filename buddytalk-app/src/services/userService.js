/**
 * User Management Service
 * Handles user profile storage and retrieval
 */

const USERS_STORAGE_KEY = 'buddytalk_users';

/**
 * Get all users from localStorage
 * @returns {Array} Array of user objects
 */
export function getUsers() {
  try {
    const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
    if (!usersJson) {
      return [];
    }
    return JSON.parse(usersJson);
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
}

/**
 * Add a new user
 * @param {Object} user - User object with name, age, and optional avatar
 * @returns {Object} The created user with ID
 */
export function addUser(user) {
  try {
    const users = getUsers();
    const newUser = {
      id: Date.now().toString(),
      name: user.name,
      age: parseInt(user.age, 10), // Ensure age is a number
      avatar: user.avatar || null, // Custom avatar emoji
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    return newUser;
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
}

/**
 * Update an existing user
 * @param {string} userId - User ID
 * @param {Object} updates - Fields to update (name, age, avatar)
 * @returns {Object} Updated user object
 */
export function updateUser(userId, updates) {
  try {
    const users = getUsers();
    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const updatedUser = {
      ...users[userIndex],
      ...updates,
    };

    // Ensure age is a number
    if (updates.age !== undefined) {
      updatedUser.age = parseInt(updates.age, 10);
    }

    users[userIndex] = updatedUser;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Object|null} User object or null
 */
export function getUserById(userId) {
  const users = getUsers();
  return users.find((u) => u.id === userId) || null;
}

/**
 * Delete user by ID
 * @param {string} userId - User ID
 */
export function deleteUser(userId) {
  try {
    const users = getUsers();
    const filteredUsers = users.filter((u) => u.id !== userId);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(filteredUsers));
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}
