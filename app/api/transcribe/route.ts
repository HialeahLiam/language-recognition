export async function POST(req: Request) {
  console.log("hello logs");
  console.log(req.headers.get("x-forwarded-for"));
  return new Response("all good!");
}
