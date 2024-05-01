import { Prisma } from "@prisma/client";
import { prisma } from "../configs";
import xlsx from "xlsx";
import { Conflict, NotFound } from "http-errors";

export const bulkUploadService = {
  async uploadUser(excel?: any) {
    try {
      //get worksheet from buffer
      const sheetsFile = xlsx.read(Buffer.from(excel?.data), {
        cellDates: true,
      });

      console.log(sheetsFile);

      // Create 3 states for storing uploaded, not uploaded and already uploaded data
      let notUploaded: any[] = [];
      let uploaded: any[] = [];
      let alreadyUploaded: any[] = [];
      //create a for in loop to find data from all the sheets
      await Promise.all(
        sheetsFile.SheetNames.map((item: any) => {
          return new Promise<Promise<void> | void>(async (resolve, reject) => {
            try {
              const excelDataSheet = sheetsFile.Sheets[item];
              console.log({ excelDataSheet });
              //convert it to json
              const jsonWorkSheetData = xlsx.utils.sheet_to_json<any>(
                excelDataSheet,
                {
                  rawNumbers: true,
                  raw: true,
                  defval: "",
                }
              );

              // //delete other user
              // const userEmpId = jsonWorkSheetData?.map(
              //   (inner) => inner?.["Employee ID"]
              // );

              // await prisma.user.deleteMany({
              //   where: { empId: { notIn: userEmpId } },
              // });

              await Promise.all(
                jsonWorkSheetData?.map((item: any) => {
                  return new Promise(async (resolve, reject) => {
                    try {
                      //convert data to desire format
                      const roleData: any = {
                        Doer: "EMPLOYEE",
                        None: "EMPLOYEE",
                        Management: "MANAGEMENT",
                      };

                      const userData = {
                        empId: item?.["Employee ID"]?.trim(),
                        name: item?.["Employee Name"]?.trim(),
                        gender:
                          item?.["Gender"]?.trim()?.toUpperCase() === "M"
                            ? "Male"
                            : "Female",

                        fatherName: item?.["Father Name"]?.trim(),
                        type:
                          item?.["Data Access Level Identifier"]
                            ?.trim()
                            ?.includes("Module") &&
                          item?.["Data Access Level Identifier"]
                            ?.trim()
                            ?.includes("Project")
                            ? "PROJECT_MODULE"
                            : item?.["Data Access Level Identifier"]
                                ?.trim()
                                ?.includes("Self")
                            ? "MY_SELF"
                            : item?.["Data Access Level Identifier"]
                                ?.trim()
                                ?.includes("Project")
                            ? "PROJECT"
                            : item?.["Data Access Level Identifier"]
                                ?.trim()
                                ?.includes("Module")
                            ? "MODULE"
                            : item?.["Data Access Level Identifier"]
                                ?.trim()
                                ?.includes("All")
                            ? "ALL"
                            : undefined,
                        dob: item?.["Date Of Birth"]?.trim()
                          ? new Date(item?.["Date Of Birth"]?.trim())
                          : undefined,
                        doj: item?.["Joining Date"]?.trim()
                          ? new Date(item?.["Joining Date"]?.trim())
                          : undefined,
                        dol: item?.["Leaving Date"]?.trim()
                          ? new Date(item?.["Leaving Date"]?.trim())
                          : undefined,
                        mobileNo: item?.["HR updated Mobile"]
                          ? item?.["HR updated Mobile"]?.toString()
                          : undefined,
                        personalNo: item?.["User Updated Mobile"]
                          ? item?.["User Updated Mobile"]?.toString()
                          : undefined,
                        state: item?.["Address:State"]?.trim(),
                        district: item?.["Address:District"]?.trim(),
                        area: item?.["Address:Area"]?.trim(),
                        pin: item?.PIN?.toString(),
                        appAccess: item?.["App Access"]?.trim()?.toUpperCase(),
                        appAccessLevel: item?.["App Access Level"]?.trim(),
                        designation: item?.["Designation"]?.trim(),
                        role: roleData?.[item?.["App Access Level"].trim()],
                      };

                      //check if data already exists

                      const userExist = await prisma.user.findFirst({
                        where: {
                          empId: userData?.empId,
                        },
                        select: {
                          id: true,
                        },
                      });

                      if (userExist?.id) {
                        alreadyUploaded?.push(userData);
                      } else {
                        uploaded.push(userData);
                      }

                      resolve(true);
                    } catch (error) {
                      reject(error);
                    }
                  });
                })
              );

              resolve();
            } catch (error) {
              reject(error);
            }
          });
        })
      );

      //   console.log({ alreadyUploaded });

      //   //update already uploaded
      //   await Promise.all(
      //     alreadyUploaded?.map((item: any) => {
      //       return new Promise(async (resolve, reject) => {
      //         try {
      //           const user = await prisma.user.update({
      //             where: {
      //               empId: item?.empId,
      //             },
      //             data: {
      //               name: item?.name,
      //               gender: item?.gender,
      //               fatherName: item?.fatherName,
      //               type: item?.type,
      //               dob: item?.dob,
      //               doj: item?.doj,
      //               dol: item?.dol,
      //               mobileNo: item?.mobileNo,
      //               personalNo: item?.personalNo,
      //               state: item?.state,
      //               district: item?.district,
      //               area: item?.area,
      //               pin: item?.pin,
      //               appAccess: item?.appAccess,
      //               appAccessLevel: item?.appAccessLevel,
      //               designation: item?.designation,
      //             },
      //           });

      //           resolve(user);
      //         } catch (error) {
      //           reject(error);
      //         }
      //       });
      //     })
      //   );
      //   //create new user
      //   await Promise.all(
      //     uploaded?.map((item: any) => {
      //       return new Promise(async (resolve, reject) => {
      //         try {
      //           const user = await prisma.user.create({
      //             data: {
      //               empId: item?.empId,
      //               name: item?.name,
      //               gender: item?.gender,
      //               fatherName: item?.fatherName,
      //               type: item?.type,
      //               dob: item?.dob,
      //               doj: item?.doj,
      //               dol: item?.dol,
      //               mobileNo: item?.mobileNo,
      //               personalNo: item?.personalNo,
      //               state: item?.state,
      //               district: item?.district,
      //               area: item?.area,
      //               pin: item?.pin,
      //               appAccess: item?.appAccess,
      //               appAccessLevel: item?.appAccessLevel,
      //               designation: item?.designation,
      //             },
      //           });

      //           resolve(user);
      //         } catch (error) {
      //           reject(error);
      //         }
      //       });
      //     })
      //   );

      return {
        uploaded: uploaded?.length,
        notUploaded: notUploaded,
        alreadyUploaded: alreadyUploaded,
      };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error?.message : "Error creating module"
      );
    }
  },
  async uploadProduct(excel?: any) {
    try {
      //get worksheet from buffer
      const sheetsFile = xlsx.read(Buffer.from(excel?.data), {
        cellDates: true,
      });

      // Create 3 states for storing uploaded, not uploaded and already uploaded data
      let notUploaded: any[] = [];
      let uploaded: any[] = [];
      let alreadyUploaded: any[] = [];
      //create a for in loop to find data from all the sheets
      await Promise.all(
        sheetsFile.SheetNames.map((item: any) => {
          return new Promise<Promise<void> | void>(async (resolve, reject) => {
            try {
              const excelDataSheet = sheetsFile.Sheets[item];
              //convert it to json
              const jsonWorkSheetData = xlsx.utils.sheet_to_json<any>(
                excelDataSheet,
                {
                  rawNumbers: true,
                  raw: true,
                  defval: "",
                }
              );

              const prductDataArr: any = await Promise.all(
                jsonWorkSheetData?.map((item: any) => {
                  return new Promise(async (resolve, reject) => {
                    try {
                      //convert data to desire format

                      const productData = {
                        title: item?.["Title"]?.toString()?.trim(),
                        slug: item?.["Slug"]?.toString()?.trim(),
                        description: item?.["Description"]?.toString()?.trim(),
                        measureType: item?.["Measure Type"]?.toString()?.trim(),
                        measureUnit: item?.["Measure Unit"]?.toString()?.trim(),
                        // color: item?.["Color"].trim(),
                        // size: item?.["Size"].toString().trim(),
                        regularPrice: item?.["Regular Price"],
                        salePrice: item?.["Sale Price"],
                        stock: item?.["Stock"],
                      };

                      //CHECK IF THE PRODUCT ALREADY EXISTS
                      const isSlugExists = await prisma.product.findFirst({
                        where: { slug: productData.slug },
                      });
                      if (isSlugExists)
                        throw new Conflict(
                          `Product with slug: ${isSlugExists.slug} already exists`
                        );

                      resolve(productData);
                    } catch (error) {
                      notUploaded.push(item);
                      reject(error);
                    }
                  });
                })
              );

              // const createdProducts = await prisma.product.createMany({
              //   data: { ...prductDataArr[0], isParentProduct: true },
              // });

              const createdProductsArr = [];

              for (const product of prductDataArr) {
                const createdProduct = await prisma.product.create({
                  data: {
                    ...product,
                    isParentProduct: true,
                  },
                });
                createdProductsArr.push(createdProduct);
              }

              for (const product of createdProductsArr) {
                await prisma.product.update({
                  where: {
                    id: product.id,
                  },
                  data: {
                    parentProductId: product.id,
                  },
                });
              }

              resolve();
            } catch (error) {
              reject(error);
            }
          });
        })
      );

      return {
        uploaded: uploaded?.length,
        notUploaded: notUploaded,
        alreadyUploaded: alreadyUploaded,
      };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error?.message : "Error creating module"
      );
    }
  },
};
