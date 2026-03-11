import axios from "axios";
const fs = require("fs");
const path = require("path");

const YANDEXGPT_FOLDER_ID = process.env.YANDEXGPT_FOLDER_ID!;
const YANDEXGPT_API_KEY = process.env.YANDEXGPT_API_KEY!;

interface GeocoderData {
  place_id: string;
  licence: string;
  osm_type: string;
  osm_id: string;
  lat: string;
  lon: string;
  display_name: string;
  address: GeocoderDataAddress;
  boundingbox: string[];
}
interface GeocoderDataAddress {
  supermarket: string;
  house_number: string;
  road: string;
  quarter: string;
  city_district: string;
  city: string;
  county: string;
  state: string;
  region: string;
  postcode: string;
  country: string;
  country_code: string;
}

class AI_GENERATE_CLASS {
  async yandexChat(prompt: string) {
    const data = {
      modelUri: `gpt://${YANDEXGPT_FOLDER_ID}/yandexgpt-lite`,
      completionOptions: {
        stream: false,
        temperature: 0.6,
        maxTokens: "1000",
      },
      messages: [
        {
          role: "system",
          text: prompt,
        },
      ],
    };

    try {
      const response = await axios.post(
        "https://llm.api.cloud.yandex.net/foundationModels/v1/completion",
        data,
        {
          headers: {
            Authorization: `Api-Key ${YANDEXGPT_API_KEY}`,
            "x-folder-id": YANDEXGPT_FOLDER_ID,
          },
        },
      );
      console.log(response.status, new Date(), prompt);
      console.log(JSON.stringify(response.data.result.alternatives, null, 2));

      return response.data.result.alternatives[0].message.text ?? "Что-то пошло не так...";
    } catch (err: any) {
      console.error("ERR: AI yandexChat:", err.message);
      return err.message;
    }
  }

  async getAddressByCoords(lat: number, lon: number): Promise<string> {
    const geoCoder = await axios<GeocoderData>("https://eu1.locationiq.com/v1/reverse", {
      params: { format: "json", lat, lon, key: process.env.LOCATION_IQ_API_KEY },
    });

    console.log("getAddressByCoords", geoCoder.data);
    return geoCoder.data.display_name;
  }

  async saveUsersPhotoLink(userInfo: string, fileLink: string, other?: string) {
    // Здесь можно реализовать сохранение ссылки на фото в базу данных, если это необходимо
    console.log(`Saving photo link for user ${userInfo}: ${fileLink} ${other}`);
 

    const dbFile = path.join(__dirname, "..", "myTmpDb.txt");
    const entry = `${userInfo} ${fileLink} (${other})\n`;

    if (fs.existsSync(dbFile)) {
      fs.appendFileSync(dbFile, entry);
    } else {
      fs.writeFileSync(dbFile, entry);
    }

  }
}

export const AI_GENERATE = new AI_GENERATE_CLASS();
