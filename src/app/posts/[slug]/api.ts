export function getComments(postID: number) {
  return fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/comments?postID=${postID}`,
    {
      next: {
        revalidate: 5, // هر ۳ ثانیه یک بار رفرش شود
      },
    },
  ).then((r) => r.json());
}
