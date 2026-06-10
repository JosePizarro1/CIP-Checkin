import { pgTable, serial, varchar, boolean, timestamp } from "drizzle-orm/pg-core";

export const registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  ticketNumber: varchar("ticket_number", { length: 20 }).notNull().unique(),
  source: varchar("source", { length: 20 }).notNull(), // 'REGISTROS' or 'COMPRADOS'
  cip: varchar("cip", { length: 20 }),
  lastName: varchar("last_name", { length: 200 }),
  firstName: varchar("first_name", { length: 200 }),
  chapter: varchar("chapter", { length: 200 }),
  specialty: varchar("specialty", { length: 200 }),
  phone: varchar("phone", { length: 20 }),
  purchaseDate: timestamp("purchase_date"),
  dish: varchar("dish", { length: 20 }),
  attended: boolean("attended").notNull().default(false),
  checkinTime: timestamp("checkin_time"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
