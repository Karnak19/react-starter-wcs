const axios = require('axios');

async function downloadGist(url, ids) {
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'curl/7.30.0',
        Host: 'api.github.com',
        Accept: '*/*',
      },
    });

    return res.data
      .filter((gist) => ids.some((id) => id === gist.id))
      .map((e) => e.files);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    return error;
  }
}

module.exports = downloadGist;
