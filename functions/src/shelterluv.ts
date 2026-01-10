import { onSchedule } from "firebase-functions/v2/scheduler";
import { defineSecret } from "firebase-functions/params";
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { logger } from "firebase-functions/v2";
import { ShelterluvCat } from "./types/cat-info.js";
import axios from "axios";

initializeApp();

const db = getFirestore();
const shelterluvApiKey = defineSecret("SHELTERLUV_API_KEY");

export const syncShelterluvCats = onSchedule(
    {
        schedule: "every 15 minutes",
        secrets: [shelterluvApiKey],
    },
    async () => {
        try {
            const apiKey = shelterluvApiKey.value();

            const limit = 100;
            let offset = 0;
            let has_more = true;
            const allCats: ShelterluvCat[] = [];

            while (has_more) {
                const response = await axios.get(
                    "https://www.shelterluv.com/api/v1/animals",
                    {
                        headers: {
                            "x-api-key": apiKey,
                        },
                        params: {
                            status_type: "in custody",
                            offset: offset,
                            limit: limit,
                        },
                        timeout: 10000,
                    }
                );
                const cats = response.data.animals;
                allCats.push(...cats);
                has_more = response.data.has_more;
                offset += limit;
            }

            logger.info("Cats fetched from Shelterluv: ", allCats.length);

            const batch = db.batch();

            allCats.forEach((cat: ShelterluvCat) => {
                const ref = db.collection("cats").doc(cat.ID);

                batch.set(
                    ref,
                    {
                        id: cat.ID,
                        name: cat.Name,
                        sex: cat.Sex ?? null,
                        color: cat.Color ?? null,
                        pattern: cat.Pattern ?? null,
                        photoUrl: cat.CoverPhoto ?? null,
                        intakeDate: cat.LastIntakeUnixTime ?? null,
                        inFoster: cat.InFoster,
                        lastSynced: FieldValue.serverTimestamp()
                    },
                    { merge: true }
                );
            });

            await batch.commit();

            logger.info(
                `Shelterluv sync completed: ${allCats.length} cats updated.`
            );

        } catch (error) {
            if (axios.isAxiosError(error)) {
                logger.error("Shelterluv API error", {
                    status: error.response?.status,
                    data: error.response?.data
                });
            } else {
                logger.error("Unexpected error during Shelterluv sync.", error);
            }

            throw error; // ensures function reports failure
        }
    }
);
