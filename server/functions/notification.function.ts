import { Prisma } from "@prisma/client";
import { prisma } from "../configs";
import { admin } from "../configs/firebase.config";

interface GetOptions {
  skip?: number;
  take?: number;
  search?: string;
  userId?: string;
  isRead?: boolean;
}

export const NotificationFunction = {
  // CRUD
  async create(input: Prisma.NotificationCreateInput) {
    const notification = await prisma.notification.create({
      data: input,
    });

    // Get the FCM tokens of the user receiving the notification
    const userTokens = await prisma.user.findMany({
      where: { id: input.id }, // Assuming the user ID is stored in input.userId
      select: { fcmToken: true },
    });

    const tokens = userTokens.map(({ fcmToken }) => [
      fcmToken?.android,
      fcmToken?.ios,
      fcmToken?.web,
    ]);

    // Flatten the tokens array and remove any undefined or null values
    const validTokens = tokens?.flat().filter((token) => !!token) as string[];

    if (validTokens.length === 0) {
      // No valid FCM tokens to send a notification
      return notification;
    }

    const payload = {
      notification: {
        title: input.title,
        body: input.body,
      },
      data: {
        title: input.title,
        body: input.body,
      },
    };

    // Send a multicast notification to all valid tokens
    const response = await admin.messaging().sendMulticast({
      tokens: validTokens,
      notification: payload.notification,
      data: payload.data,
    });

    // Handle the response if needed
    response.responses.forEach((result, index) => {
      if (result.error) {
        console.error(
          `Failed to send notification to user with token ${validTokens[index]}: ${result.error}`
        );
        // Handle the error as needed
      } else {
        console.log(
          `Notification sent to user with token ${validTokens[index]}`
        );
        // Handle the success as needed
      }
    });

    return notification;
  },
  async readAll(userId: string) {
    // Check if both skip and take options are provided for pagination
    const notifications = await prisma.notification.updateMany({
      where: {
        user: {
          id: userId,
        },
      },
      data: {
        isRead: true,
      },
    });

    return notifications;
  },
  async update(id: string, data: Prisma.NotificationUpdateInput) {
    const isNotificationExists = await prisma.notification.findUnique({
      where: { id },
    });
    if (!isNotificationExists) throw new Error("Notification not found!");
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data,
    });
    return updatedNotification;
  },
  async delete(id: string) {
    const isNotificationExists = await prisma.notification.findUnique({
      where: { id },
    });
    if (!isNotificationExists) throw new Error("Notification not found!");
    const deletedNotification = await prisma.notification.delete({
      where: { id },
    });
    return deletedNotification;
  },
  async readById(id: string) {
    const notification = await prisma.notification.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        body: true,
        createdAt: true,
        user: { select: { name: true, empId: true } },
      },
    });
    return notification;
  },

  async deleteAll({
    userIds,
    notificationIds,
    removeReadData,
    all,
    empId,
  }: {
    userIds?: string[];
    notificationIds?: string[];
    removeReadData?: boolean;
    all?: boolean;
    empId?: string;
  } = {}) {
    let where: Prisma.NotificationWhereInput = {};

    if (empId && !userIds && !all) {
      where = {
        user: { id: empId },
      };
    }
    if (all) {
      where = {};
    }
    if (userIds) {
      where = {
        user: { id: { in: userIds } },
      };
    }

    if (notificationIds) {
      where = {
        ...where,
        id: { in: notificationIds },
      };
    }

    if (removeReadData !== undefined) {
      where = {
        ...where,
        isRead: removeReadData,
      };
    }

    // Delete matching notifications
    const deletedNotifications = await prisma.notification.deleteMany({
      where,
    });

    return deletedNotifications;
  },

  async sendToMultipleUsers(
    userIds: string[],
    input: Prisma.NotificationCreateInput,
    sendAll?: boolean
  ) {
    let selectedUserIds = userIds;

    if (sendAll) {
      selectedUserIds = (
        await prisma.user.findMany({ select: { id: true } })
      ).map((user) => user.id);
    }

    const notifications = await Promise.all(
      selectedUserIds.map(async (userId) => {
        const notification = await prisma.notification.create({
          data: {
            ...input,
            user: { connect: { id: userId } },
          },
        });

        // Get the FCM token of the user receiving the notification
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { fcmToken: true },
        });

        if (user && user.fcmToken) {
          const validTokens = [
            user.fcmToken.android,
            user.fcmToken.ios,
            user.fcmToken.web,
          ].filter((token) => !!token) as string[];

          if (validTokens.length > 0) {
            const payload = {
              notification: {
                title: input.title,
                body: input.body,
              },
              data: {
                title: input.title,
                body: input.body,
              },
            };

            const response = await admin.messaging().sendMulticast({
              tokens: validTokens,
              notification: payload.notification,
              data: payload.data,
            });

            response.responses.forEach((result, index) => {
              if (result.error) {
                console.error(
                  `Failed to send notification to user ${userId} with token ${validTokens[index]}: ${result.error}`
                );
                // Handle the error as needed
              } else {
                console.log(
                  `Notification sent to user ${userId} with token ${validTokens[index]}`
                );
                // Handle the success as needed
              }
            });
          }
        }

        return notification;
      })
    );

    return notifications;
  },

  // get all notifications
  async getAllNotification({
    page,
    limit,
    title,
    isRead,
    orderBy,
    userId,
  }: {
    page?: number;
    limit?: number;
    title?: string;
    isRead?: boolean;
    orderBy?: string;
    userId: string;
  }) {
    try {
      let skip;
      let take = limit;
      let notifications;
      const _orderBy: Prisma.NotificationOrderByWithAggregationInput =
        orderBy?.includes("createdAt")
          ? { createdAt: orderBy === "createdAt:asc" ? "asc" : "desc" }
          : orderBy?.includes("updatedAt")
          ? { updatedAt: orderBy === "updatedAt:asc" ? "asc" : "desc" }
          : {};

      const OR: Prisma.NotificationWhereInput[] | undefined =
        !title && !userId && !isRead
          ? undefined
          : [
              {
                title:
                  typeof title === "string"
                    ? { contains: title, mode: "insensitive" }
                    : undefined,
              },
              {
                isRead:
                  typeof isRead === "boolean" ? { equals: isRead } : undefined,
              },
              {
                userId:
                  typeof userId === "string" ? { equals: userId } : undefined,
              },
            ];

      const where: Prisma.NotificationWhereInput = { OR };

      if (
        typeof page !== "undefined" &&
        typeof limit !== "undefined" &&
        page &&
        limit
      ) {
        skip = (+page - 1) * +limit;
        notifications = await prisma.notification.findMany({
          skip,
          take,
          orderBy: { createdAt: "desc" },
          where,
          include: {
            user: {
              select: {
                empId: true,
                name: true,
                phone: true,
              },
            },
          },
        });
      } else {
        notifications = await prisma.notification.findMany({
          orderBy: _orderBy,
          where,
          include: {
            user: {
              select: {
                empId: true,
                name: true,
                phone: true,
              },
            },
          },
        });
      }

      return {
        notifications,
        pagination: {
          limit,
          page,
          total: await prisma.notification.count({ where }),
        },
      };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Get all notifications failed"
      );
    }
  },

  async getAllNotificationAggregate({
    page,
    limit,
    title,
    isRead,
    orderBy,
    userId,
    searchDate,
  }: {
    page?: number;
    limit?: number;
    title?: string;
    isRead?: string;
    orderBy?: string;
    userId?: string;
    searchDate?: string;
  }) {
    try {
      console.log({ searchDate });
      const filterArgs: any[] = [];
      const paginationArg: any[] = [];
      let Title =
        title && title.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1").trim();

      console.log("dt", new Date().getFullYear());
      if (searchDate) {
        const startDate = new Date(searchDate);
        const endDate = new Date();
        console.log({ startDate, endDate });
        filterArgs.push(
          {
            $addFields: {
              startDate: {
                $dateFromParts: {
                  year: new Date(startDate).getFullYear(),
                  month: new Date(startDate).getMonth() + 1,
                  day: new Date(startDate).getDate(),
                  hour: new Date(startDate).getHours(),
                  minute: new Date(startDate).getMinutes(),
                  timezone: "Asia/Kolkata",
                },
              },
              endDate: {
                $dateFromParts: {
                  year: new Date(endDate).getFullYear(),
                  month: new Date(endDate).getMonth() + 1,
                  day: new Date(endDate).getDate(),
                  hour: new Date(endDate).getHours(),
                  minute: new Date(endDate).getMinutes(),
                  timezone: "Asia/Kolkata",
                },
              },
            },
          },
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $gte: ["$notification.createdAt", "$startDate"],
                  },
                  {
                    $lte: ["$notification.createdAt", "$endDate"],
                  },
                ],
              },
            },
          }
        );
      }

      if (Title) {
        filterArgs.push({
          $match: {
            "notification.title": {
              $regex: Title,
              $options: "i",
            },
          },
        });
      }

      if (isRead === "true") {
        filterArgs.push({
          $match: {
            isRead: true,
          },
        });
      }

      if (isRead === "false") {
        filterArgs.push({
          $match: {
            "notification.isRead": false,
          },
        });
      }

      if (orderBy === "true") {
        filterArgs.push({
          $sort: {
            "notification.createdAt": -1,
          },
        });
      }

      if (orderBy === "false") {
        filterArgs.push({
          $sort: {
            "notification.createdAt": 1,
          },
        });
      }

      if (userId) {
        filterArgs.push({
          $match: {
            users: {
              $elemMatch: {
                userId: userId,
              },
            },
          },
        });
      }

      if (page) {
        //pagination code
        paginationArg.push({
          $skip: Number(limit || 0) * (Number(page) - 1),
        });
      }
      if (limit) {
        paginationArg.push({
          $limit: Number(limit || 0),
        });
      }

      const aggregationArgs: any = [
        {
          $lookup: {
            from: "USERS",
            localField: "userId",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: "$userDetails",
        },
        {
          $group: {
            _id: "$title",
            notification: {
              $first: {
                id: "$_id",
                title: "$title",
                body: "$body",
                imagePath: "$imagePath",
                imageUrl: "$imageUrl",
                isRead: "$isRead",
                updatedAt: "$updatedAt",
                createdAt: "$createdAt",
              },
            },
            users: {
              $addToSet: {
                userId: "$userId",
                empId: "$empId",
                userName: "$userDetails.name", // Replace with actual field name
                userEmail: "$userDetails.email", // Replace with actual field name
                isRead: "$isRead",
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            notification: 1,
            users: 1,
          },
        },
        {
          $sort: {
            "notification.createdAt": -1,
          },
        },
      ];

      const [notifications, totalDataCount]: any = await Promise.all([
        prisma.notification.aggregateRaw({
          pipeline: [...aggregationArgs, ...filterArgs, ...paginationArg],
        }),
        prisma.notification.aggregateRaw({
          pipeline: [
            ...aggregationArgs,
            ...filterArgs,
            {
              $count: "totalCount",
            },
          ],
        }),
      ]);

      console.log(totalDataCount);

      return {
        notifications,
        pagination: {
          total: totalDataCount[0]?.totalCount || 0,
          page: page,
          limit: limit,
        },
      };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Get all notifications failed"
      );
    }
  },
};
