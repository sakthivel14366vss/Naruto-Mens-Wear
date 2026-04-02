export async function init() {
  console.log('init hook function');
}

export async function handle({ event, resolve }) {
  console.log('handle hook function');
  console.log(Object.keys(event));
  console.log(event.get);
  const response = await resolve(event);
  return response;
}
