import { useUserContext } from "@/contexts/AuthContext";
import {
  useLikePost,
  useSavePost,
  useDeleteSavedPost,
  useGetCurrentUser,
} from "@/lib/react-query/queriesAndMutations";
import { checkIsLiked } from "@/lib/utils";
import { Models } from "appwrite";
import { FC, useEffect, useState } from "react";
import AlertDialogWrapper from "./AlertDialogWrapper";

type PostStatsProps = {
  post: Models.Document;
  userId: string;
};

const PostStats: FC<PostStatsProps> = ({ post, userId }) => {
  const likesList = post.likes.map((user: Models.Document) => user.$id);
  //likeList holds document ids of users who liked the post

  const [likes, setLikes] = useState<string[]>(likesList);
  const [isSaved, setIsSaved] = useState(false);

  const { mutate: likePost } = useLikePost();
  const { mutate: savePost } = useSavePost();
  const { mutate: deleteSavePost } = useDeleteSavedPost();

  const { data: currentUser } = useGetCurrentUser();
  const { isAnonymous } = useUserContext();

  //Get the post document from the array of all the saved posts of current user
  const savedPostRecord = currentUser?.save.find(
    (record: Models.Document) => record.post.$id === post.$id
  );

  useEffect(() => {
    if (savedPostRecord) setIsSaved(true);
  }, []);

  // ========================= HANDLE LIKE POST
  const handleLikePost = async (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();

    let likesArray = [...likes];

    // check if the user has already liked the post or not
    if (likesArray.includes(userId)) {
      likesArray = likesArray.filter((Id) => Id !== userId); //if user has already liked the post, this time, remove their id form this list
    } else {
      likesArray.push(userId);
    }

    setLikes(likesArray);
    likePost({ postId: post.$id, likesArray });
  };
  // ========================= HANDLE SAVE POST
  const handleSavePost = async (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();
  
    if (savedPostRecord) {
      // Update UI immediately
      setIsSaved(false);
  
      // Perform async operation in the background
      try {
        await deleteSavePost(savedPostRecord.$id);
      } catch (error) {
        // Handle error if needed, e.g., rollback UI change
        setIsSaved(true);
        console.error("Failed to unsave post", error);
      }
      return;
    }
  
    // Update UI immediately
    setIsSaved(true);
  
    // Perform async operation in the background
    try {
      await savePost({ userId: userId, postId: post.$id });
    } catch (error) {
      // Handle error if needed, e.g., rollback UI change
      setIsSaved(false);
      console.error("Failed to save post", error);
    }
  };
  


  const containerStyles = location.pathname.startsWith("/profile")
    ? "w-full"
    : "";

  return (
    <div
      className={`flex justify-between items-center z-20 ${containerStyles}`}
    >
      <div className="flex gap-2 mr-5">
        {isAnonymous ? (
          <AlertDialogWrapper
            title="Sign Up to Like Posts"
            description="Sign up to like and save posts. Create an account to get started."
          >
            <img
              src={`${
                checkIsLiked(likes, userId)
                  ? "/assets/icons/liked.svg"
                  : "/assets/icons/like.svg"
              }`}
              alt="like"
              width={20}
              height={20}
              className="cursor-pointer"
            />
          </AlertDialogWrapper>
        ) : (
          <img
            src={`${
              checkIsLiked(likes, userId)
                ? "/assets/icons/liked.svg"
                : "/assets/icons/like.svg"
            }`}
            alt="like"
            width={20}
            height={20}
            onClick={(e) => handleLikePost(e)}
            className="cursor-pointer"
          />
        )}
        <p className="small-medium lg:base-medium">{likes.length}</p>
      </div>

      <div className="flex gap-2">
        {isAnonymous ? (
          <AlertDialogWrapper
            title="Sign Up to Save Posts"
            description="Sign up to like and save posts. Create an account to get started."
          >
            <img
              src={
                isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"
              }
              alt="share"
              width={20}
              height={20}
              className="cursor-pointer"
            />
          </AlertDialogWrapper>
        ) : (
          <img
            src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
            alt="share"
            width={20}
            height={20}
            className="cursor-pointer"
            onClick={(e) => handleSavePost(e)}
          />
        )}
      </div>
    </div>
  );
};

export default PostStats;
