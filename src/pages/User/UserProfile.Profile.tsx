setLoadingProfile(true);
try {
  console.log("Fetching user profile for ID:", currentUserId);
  const data = await getUserById(currentUserId);
  if (data) {
    // ... existing code ...
  }
} catch (error) {
  // ... existing code ...
}
