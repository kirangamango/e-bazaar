import { User } from "@prisma/client";
import { BadRequest } from "http-errors";
import { prisma } from "../configs";
import { admin } from "../configs/firebase.config";

export const pushNotification = async ({
  title,
  body,
  imageUrl,
  imagePath,
  userIds,
  users,
  data,
  saveToDb = false,
}: {
  title: string;
  body: string;
  imageUrl?: string;
  imagePath?: string;
  userIds?: string[];
  users?: Partial<User>[];
  data?: object;
  saveToDb?: boolean;
}) => {
  return new Promise<void>(async (resolve, reject) => {
    try {
      if (!users && !userIds)
        throw new BadRequest(
          "NotificationFunction users or userIds is required."
        );

      userIds &&
        (Array.isArray(userIds) ? (userIds = userIds) : (userIds = [userIds]));

      const formattedUserIds =
        userIds &&
        userIds.filter(
          (userId) => userId !== undefined && userId !== null && userId !== ""
        );

      //save user notification to db
      if (formattedUserIds?.length && saveToDb) {
        const notificationData = await prisma.notification.createMany({
          data: formattedUserIds?.map((item) => {
            return {
              title: title,
              body: body,
              userId: item,
              iconPath: imagePath,
              iconUrl: imageUrl,
            };
          }),
        });
      }

      //extract the fmc token from user model then send push notification
      const usersDetails =
        users ||
        (await prisma.user.findMany({
          where: {
            id: {
              in: formattedUserIds,
            },
          },
          select: {
            fcmToken: true,
          },
        }));

      const args: any = data
        ? data
        : {
            screen: "Notification",
          };
      const tokens: any[] = usersDetails.map((user) => {
        if (user?.fcmToken) return Object.values(user.fcmToken);
        return [];
      });

      const tempStr = tokens.flat();
      const makeStString = tempStr.filter((item) => item !== null) as string[];

      if (makeStString?.length) {
        await admin.messaging().sendMulticast({
          tokens: makeStString,
          notification: {
            title,
            body,
            imageUrl,
          },
          data: args,
        });
      }
      return resolve();
    } catch (error) {
      return resolve();
      // throw error;
    }
  });
};
