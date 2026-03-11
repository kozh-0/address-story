import axios from "axios";
import exifr from "exifr";
import { Update } from "telegraf/typings/core/types/typegram";
import { Context, Telegraf } from "telegraf";
import { AI_GENERATE } from "./getAiContent";

interface ParcerData {
  Make: string;
  Model: string;
  Orientation: string;
  XResolution: number;
  YResolution: number;
  ResolutionUnit: string;
  Software: string;
  ModifyDate: string;
  HostComputer: string;
  ExposureTime: number;
  FNumber: number;
  ExposureProgram: string;
  ISO: number;
  ExifVersion: string;
  DateTimeOriginal: string;
  CreateDate: string;
  OffsetTime: string;
  OffsetTimeOriginal: string;
  OffsetTimeDigitized: string;
  ShutterSpeedValue: number;
  ApertureValue: number;
  BrightnessValue: number;
  ExposureCompensation: number;
  MeteringMode: string;
  Flash: string;
  FocalLength: number;
  SubSecTimeOriginal: string;
  SubSecTimeDigitized: string;
  ColorSpace: number;
  ExifImageWidth: number;
  ExifImageHeight: number;
  SensingMethod: string;
  SceneType: string;
  ExposureMode: string;
  WhiteBalance: string;
  FocalLengthIn35mmFormat: number;
  LensInfo: number[];
  LensMake: string;
  LensModel: string;
  CompositeImage: string;
  GPSLatitudeRef: string;
  GPSLatitude: number[];
  GPSLongitudeRef: string;
  GPSLongitude: number[];
  GPSAltitudeRef: number[];
  GPSAltitude: number;
  GPSTimeStamp: string;
  GPSSpeedRef: string;
  GPSSpeed: number;
  GPSImgDirectionRef: string;
  GPSImgDirection: number;
  GPSDestBearingRef: string;
  GPSDestBearing: number;
  GPSDateStamp: string;
  GPSHPositioningError: number;
  latitude: number;
  longitude: number;
}

export default async function botInteractor(bot: Telegraf<Context<Update>>) {
  bot.start(async (ctx) => {
    console.log("ctx", ctx);
    return await ctx.reply("Bot is ready to work!");
  });

  // bot.command("help", (ctx) => {
  //   ctx.replyWithPhoto(
  //     { source: "./how-to-send-file.jpg" }, // Create a tutorial image
  //     { caption: "How to send photos with location1:" },
  //   );
  // });

  bot.on("message", async (ctx) => {
    //@ts-ignore
    if (ctx.message.text) {
      console.log(ctx.message);
      
      return ctx.reply("To get place's info, please send your photo as a FILE.");
      // AI_GENERATE.getAddressByCoords(55.751244, 37.618423);
    }

    // @ts-ignore Case 1: Photo (compressed) - EXIF stripped
    if (ctx.message.photo) {
      return await ctx.reply(
        `❌ Please send your photo as a FILE to preserve location data.`,
      );
    }

    // @ts-ignore Case 2: Document (file) - EXIF preserved
    if (ctx.message.document) {
      ctx.sendChatAction("typing");
      try {
        
        // @ts-ignore
        const fileLink = await ctx.telegram.getFileLink(ctx.message.document.file_id);
        const tags: ParcerData = await exifr.parse(fileLink.href);
        console.log("All tags and fileLink:", fileLink, tags);

          AI_GENERATE.saveUsersPhotoLink(`${ctx.message.from.username} ${ctx.message.from.id}`, fileLink.href, `${tags.Make} ${tags.Model} - ${new Date(tags.CreateDate).toLocaleString()}`);

        if (tags?.latitude && tags.longitude) {
          const formattedDate = new Date(tags.CreateDate).toLocaleString();

          const address = await AI_GENERATE.getAddressByCoords(tags.latitude, tags.longitude);

          const prompt = `Расскажи историю адреса и кратко перечисли интересные места рядом. 
Адрес - ${address}. Не превышай 4096 символов.`;

          const aiResp: string = await AI_GENERATE.yandexChat(prompt);

          await ctx.reply(
            `Photo was made on ${tags.Make} ${tags.Model} at ${formattedDate} in ${address}.\n
[Google Maps](https://www.google.com/maps/place/${tags.latitude},${tags.longitude})
            \n\n${aiResp}`,
          );
        } else {
          console.log("kek TUTU");

          return await ctx.reply(
            "No GPS data found in the file. Make sure:\n" +
              "1. Location was enabled when taking the photo\n" +
              "2. You sent it as File (not Photo)\n" +
              "3. Your camera app saves location data",
          );
        }
      } catch (error) {
        console.error("Error:", error);
        await ctx.reply("Error processing the file.");
      }
    }
  });

  // Взаимодействие с ботом
  bot.on("text", async (ctx) => {
    try {
      if (ctx.message.chat.id !== parseInt(process.env.MY_USER_TG_ID!)) {
        console.log(`Чужак ${ctx.message.from.username}: ${ctx.message.text}`);
        return await ctx.reply("Доступ запрещен ¯\\_(ツ)_/¯");
      }

      const input = ctx.message.text.trim();
      if (input.toLowerCase() === "ау") return ctx.reply("Я фурычу!");
    } catch (error) {
      console.error("ERR: botInteractor:", error);
    }
  });

  bot.catch((err, ctx) => {
    console.error("ERR: bot.catch в botInteractor:", err);
    ctx.reply("Что-то пошло совсем не так...");
  });
}
