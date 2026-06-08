import type { Offer, Task, TaskerProfile } from "./types";

export const demoTasks: Task[] = [
  {
    id: "demo-task-1",
    title: "Vyzvednout balík a dovézt domů",
    description: "Zásilkovna na Andělu, doručení na Vinohrady po 17:00.",
    category: "Doručení / vyzvednutí",
    city: "Praha",
    district: "Vinohrady",
    budget_czk: 250,
    desired_time: "Dnes",
    client_name: "Klára",
    status: "open",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-task-2",
    title: "Složit komodu z IKEA",
    description: "Jedna komoda, výtah v domě, nářadí vlastní nebo po domluvě.",
    category: "Montáž nábytku",
    city: "Praha",
    district: "Smíchov",
    budget_czk: 900,
    desired_time: "Zítra",
    client_name: "Marek",
    status: "offers_received",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-task-3",
    title: "Pomoc s odnosom věcí",
    description: "Odnést krabice ze sklepa do auta, přibližně 60 minut práce.",
    category: "Stěhování / odnos věcí",
    city: "Brno",
    district: "střed",
    budget_czk: 600,
    desired_time: "Tento týden",
    client_name: "Anna",
    status: "open",
    created_at: new Date().toISOString(),
  },
];

export const demoOffers: Offer[] = [
  {
    id: "demo-offer-1",
    task_id: "demo-task-2",
    tasker_name: "Petr",
    price_czk: 850,
    message: "Mám nářadí a můžu zítra odpoledne.",
    status: "pending",
    created_at: new Date().toISOString(),
  },
];

export const demoTaskers: TaskerProfile[] = [
  {
    id: "demo-tasker-1",
    name: "Petr",
    city: "Praha",
    categories: "Montáž, doručení",
    bio: "Mám nářadí, auto a večerní dostupnost.",
    verified: true,
    created_at: new Date().toISOString(),
  },
];
