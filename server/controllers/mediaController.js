const getDriveImage = async (req, res) => {
  const { fileId } = req.params;
  if (!/^[A-Za-z0-9_-]{10,200}$/.test(fileId)) {
    return res.status(400).json({ message: 'Invalid image identifier' });
  }

  try {
    // Drive can occasionally return an HTML interstitial from the thumbnail
    // endpoint for publicly shared files. Try its direct-view endpoint too.
    let response;
    let contentType = '';
    for (const imageUrl of [
      `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w600`,
      `https://drive.google.com/uc?export=view&id=${encodeURIComponent(fileId)}`,
    ]) {
      response = await fetch(imageUrl, { signal: AbortSignal.timeout(12000) });
      contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.startsWith('image/')) break;
    }
    if (!response?.ok || !contentType.startsWith('image/')) {
      return res.status(404).json({ message: 'Image is unavailable' });
    }

    const image = Buffer.from(await response.arrayBuffer());
    if (image.length > 10 * 1024 * 1024) {
      return res.status(413).json({ message: 'Image is too large' });
    }

    res.set({
      'Content-Type': contentType,
      'Content-Length': image.length,
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      'X-Content-Type-Options': 'nosniff',
    });
    return res.send(image);
  } catch (error) {
    return res.status(502).json({ message: 'Could not retrieve image' });
  }
};

module.exports = { getDriveImage };
