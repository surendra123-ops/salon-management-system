export async function POST() {
  return Response.json(
    { success: true, data: {} },
    {
      status: 200,
      headers: {
        "Set-Cookie": "token=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0",
      },
    }
  )
}
