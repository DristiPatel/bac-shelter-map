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

            const response = await axios.get(
                "https://www.shelterluv.com/api/v1/animals",
                {
                    headers: {
                        "X-API-Key": apiKey,
                        Accept: "application/json",
                    },
                    timeout: 10000,
                }
            );

            const cats = response.data;

            if (!Array.isArray(cats)) {
                throw new Error("Unexpected Shelterluv API response format.");
            }

            const batch = db.batch();

            cats.forEach((cat: ShelterluvCat) => {
                const ref = db.collection("cats").doc(cat.id);

                batch.set(
                    ref,
                    {
                        name: cat.name,
                        status: cat.status,
                        photoUrl: cat.photo_url ?? null,
                        intakeDate: cat.intake_date ?? null,
                        lastSynced: FieldValue.serverTimestamp()
                    },
                    { merge: true }
                );
            });

            await batch.commit();

            logger.info(
                `Shelterluv sync completed: ${cats.length} cats updated.`
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
