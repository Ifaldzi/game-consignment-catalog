import axios from 'axios';
import pool from '../db/database.js';

const scrappingUsingApi = (igUsername) => {
  axios
    .get(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${igUsername}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 105.0.0.11.118 (iPhone11,8; iOS 12_3_1; en_US; en-US; scale=2.00; 828x1792; 165586599)',
      },
    })
    .then((res) => {
      const data = res.data.data.user.edge_owner_to_timeline_media;
      console.log(res.data.data.user.edge_owner_to_timeline_media);
      processData(data, igUsername);
    })
    .catch((err) => {
      console.log(err);
    });
};

const processData = async (data, account) => {
  const offsetPost = 3;
  const posts = data.edges.slice(offsetPost);

  const processedPosts = posts.map((post) => {
    const { node } = post;
    const caption = node.edge_media_to_caption.edges[0].node.text;

    const match = caption.match(/(?:Rp|Harga\s*:)\s*(\d+(?:[.,]\d{3})*(?:[.,]\d+)?)\b/i);
    const price = match ? parseInt(match[1].trim().replaceAll(/[.,]/g, '')) : null;

    const title = caption.split('\n')[3];

    return {
      id: node.shortcode,
      title,
      caption: caption,
      img: node.display_url,
      price,
      date: new Date(node.taken_at_timestamp * 1000),
    };
  });

  console.log(processedPosts);

  try {
    const lastStoredPosts = await pool.query(
      `SELECT id, title FROM posts WHERE account = '${account}' ORDER BY date DESC LIMIT ${processedPosts.length}`,
    );
    console.log(lastStoredPosts.rows);
    const newPosts = processedPosts.filter((post) => {
      return !lastStoredPosts.rows.some((oldPost) => oldPost.id == post.id);
    });
    console.log(newPosts);
    newPosts.forEach((post) => {
      const { id, title, caption, img, price, date } = post;
      pool.query(
        'INSERT INTO posts (id, caption, title, price, date, img, account) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [id, caption, title, price, date, img, account],
        (err, res) => {
          if (err) console.log(err);
        },
      );
    });
  } catch (err) {
    console.log(err);
  }
};

export { scrappingUsingApi };
