"use server";
import Stripe from "stripe";
import { CheckoutTransactionParams } from "@/types";
import { redirect } from "next/navigation";
import { handleError } from "../utils";
import { connectToMongoDB } from "../database/connectToDb";
import Transaction from "../database/models/transaction.model";
import { updateCredits } from "./user.actions";

/**
 * Creates a Stripe checkout session to allow the user
 * to purchase credits.
 *
 * @param transaction - The transaction details including amount,
 * plan, buyer ID, etc.
 */
export async function checkoutCredits(transaction: CheckoutTransactionParams) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const amount = Number(transaction.amount) * 100;
    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price_data: {
                    currency: "inr",
                    unit_amount: amount,
                    product_data: {
                        name: transaction.plan,
                    },
                },
                quantity: 1,
            },
        ],
        metadata: {
            plan: transaction.plan,
            credits: transaction.credits,
            buyerId: transaction.buyerId,
        },
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/profile`,
        cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/`,
    });
    redirect(session.url!);
}

/**
 * Creates a new transaction in the database.
 *
 * @param transaction - The transaction parameters.
 * @returns The created transaction object.
 */
export async function createTransaction(
    transaction: CheckoutTransactionParams
) {
    try {
        await connectToMongoDB();

        // Creating a new transaction
        const newTransaction = await Transaction.create({
            ...transaction,
            buyer: transaction.buyerId,
        });

        await updateCredits(transaction.buyerId, transaction.credits);

        return JSON.parse(JSON.stringify(newTransaction));
    } catch (r) {
        handleError(r);
    }
}
