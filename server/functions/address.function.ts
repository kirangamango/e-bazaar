import { AddressType, Prisma } from "@prisma/client";
import { prisma } from "../configs";
import { NotFound, Conflict } from "http-errors";

interface CreateAddressInput {
  name: string;
  type: AddressType;
  phone: string;
  zip: string;
  city: string;
  district: string;
  state: string;
  country: string;
  addressLineOne: string;
  addressLineTwo?: string;
  landmark?: string;
  isDefault?: boolean;
  customerId: string;
}

interface UpdateAddressInput {
  name?: string;
  type?: AddressType;
  phone?: string;
  zip?: string;
  city?: string;
  state?: string;
  country?: string;
  addressLineOne?: string;
  addressLineTwo?: string;
  landmark?: string;
  isDefault?: boolean;
}

interface GetAddressesOptions {
  skip?: number;
  take?: number;
  customerId: string;
}

export const AddressFunction = {
  async createAddress(input: CreateAddressInput) {
    if (input.isDefault) {
      await prisma.address.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }
    const { customerId, ...rest } = input;
    const address = await prisma.address.create({
      data: { ...rest, customer: { connect: { id: customerId } } },
    });
    return address;
  },

  async getAddressById(id: string) {
    const address = await prisma.address.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
            id: true,
          },
        },
      },
    });
    return address;
  },

  async getAddresses(options: GetAddressesOptions) {
    const { skip = 0, take = 20, customerId } = options;

    const where: Prisma.AddressWhereInput = {
      customerId,
      status: true,
    };

    const addresses = await prisma.address.findMany({
      where,
      skip,
      take,
    });

    return {
      addresses,
      pagination: { skip, take, total: await prisma.address.count({ where }) },
    };
  },

  async updateAddress(id: string, data: UpdateAddressInput) {
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }
    const updatedAddress = await prisma.address.update({
      where: { id },
      data,
    });
    return updatedAddress;
  },

  async deleteAddress(id: string) {
    const deletedAddress = await prisma.address.update({
      where: { id },
      data: { status: false },
    });
    return deletedAddress;
  },

  async assignAddress(input: CreateAddressInput & { userId: string }) {
    const user = await prisma.user.findFirst({
      where: { id: input.userId },
      include: {
        AssignedArea: true,
      },
    });

    if (!user) throw new NotFound("user not found");

    if (
      user.role === "COMPANY_REPRESENTATIVE" &&
      user.AssignedArea?.length === 1
    ) {
      throw new Conflict("Address already assigend to company representative");
    }

    const { state, city, zip, district, ...rest } = input;
    const address = await prisma.address.create({
      data: {
        state: state.toUpperCase(),
        city: city.toUpperCase(),
        district: district.toUpperCase(),
        zip,
        type: "OFFICE",
        assignedUser: { connect: { id: input.userId } },
      },
    });
    return address;
  },
};
