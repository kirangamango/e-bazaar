import { RequestHandler } from "express";
import { NotFound } from "http-errors";
import { NotificationFunction } from "../functions";
import { prisma } from "../configs";

export const NotificationController: {
  create: RequestHandler;
  readById: RequestHandler;
  readAll: RequestHandler;
  update: RequestHandler;
  delete: RequestHandler;
  deleteAll: RequestHandler;
  deletAllByUser: RequestHandler;
  sendToMultipleUsers: RequestHandler;
  getAll: RequestHandler;
  getAllAggregate: RequestHandler;
} = {
  async getAll(req, res, next) {
    try {
      const currUser = req?.user;
      const { page, limit, title, isRead, orderBy } = req?.query;
      const { notifications, pagination } =
        await NotificationFunction.getAllNotification({
          page: typeof page === "string" ? Number(page) : undefined,
          limit: typeof page === "string" ? Number(limit) : undefined,
          title: typeof title === "string" ? title : undefined,
          isRead: isRead === "true" ? true : undefined,
          userId: currUser?.id as string,
          orderBy: typeof orderBy === "string" ? orderBy : undefined,
        });

      res.json({
        success: true,
        data: notifications,
        msg: "get all notifications successfully...",
        pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAllAggregate(req, res, next) {
    try {
      const { page, limit, title, isRead, userId, orderBy, searchDate } =
        req?.query;

      const { notifications, pagination } =
        await NotificationFunction.getAllNotificationAggregate({
          page: typeof page === "string" ? Number(page) : undefined,
          limit: typeof page === "string" ? Number(limit) : undefined,
          title: typeof title === "string" ? title : undefined,
          isRead: typeof isRead === "string" ? isRead : undefined,
          userId: typeof userId === "string" ? userId : undefined,
          orderBy: typeof orderBy === "string" ? orderBy : undefined,
          searchDate: typeof searchDate === "string" ? searchDate : undefined,
        });

      res.json({
        success: true,
        msg: "Get all notifications successfully...",
        data: notifications,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const notification = await NotificationFunction.create(req.body);

      res.json({
        success: true,
        msg: "Notification created successfully",
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  },

  async readById(req, res, next) {
    try {
      const notification = await NotificationFunction.readById(req.params.id);

      res.json({
        success: true,
        msg: "Notification retrieved successfully",
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  },

  async readAll(req, res, next) {
    try {
      const { skip, take, search, readStatus } = req.query;

      const notifications = await NotificationFunction.readAll(
        req?.user?.id as string
      );

      if (!notifications) throw new NotFound("Notifications not found");
      res.json({
        success: true,
        msg: "Notifications read all successfully",
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const updatedNotification = await NotificationFunction.update(
        req.params.id,
        req.body
      );

      res.json({
        success: true,
        msg: "Notification updated successfully",
        data: updatedNotification,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const deletedNotification = await NotificationFunction.delete(
        req.params.id
      );

      res.json({
        success: true,
        msg: "Notification deleted successfully",
        data: deletedNotification,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteAll(req, res, next) {
    try {
      const { userIds, notificationIds, removeReadData, all } = req.query;
      const deletedNotifications = await NotificationFunction.deleteAll({
        userIds:
          typeof userIds === "string" ? userIds?.split?.(",") : undefined,
        notificationIds:
          typeof notificationIds === "string"
            ? notificationIds.split(",")
            : undefined,
        removeReadData:
          removeReadData === "true" || removeReadData === "false"
            ? JSON.parse(removeReadData)
            : undefined,
        all: all === "true" ? true : false,
        empId: req?.user?.id,
      });

      res.json({
        success: true,
        msg: "Notifications deleted successfully",
        data: deletedNotifications,
      });
    } catch (error) {
      next(error);
    }
  },
  async deletAllByUser(req, res, next) {
    try {
      const currUser = req?.user;

      await prisma.notification.deleteMany({
        where: {
          userId: currUser?.id,
        },
      });

      res.json({
        success: true,
        msg: "Notification deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  async sendToMultipleUsers(req, res, next) {
    try {
      const { userIds, sendAll, ...notificationData } = req.body;
      const notifications = await NotificationFunction.sendToMultipleUsers(
        userIds,
        notificationData,
        sendAll
      );

      res.json({
        success: true,
        msg: "Notifications sent successfully",
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  },
};
