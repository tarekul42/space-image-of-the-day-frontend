import React, { useState, useEffect } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { ApodData } from '../../types/apod';
import { deleteImageBlob, getImageBlob } from '../../utils/storage';
import { isSaveData } from '../../utils/http';
import { pickDisplayUrl } from '../../utils/media';
import { MIN_IMAGE_WIDTH, MIN_IMAGE_HEIGHT } from '../../constants';

interface MediaSectionProps {
  apod: ApodData;
}

export const MediaSection: React.FC<MediaSectionProps> = ({ apod }) => {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let isCancelled = false;

    const show = (url: string) => {
      if (isCancelled) return;
      setImgUrl(url);
      setIsReady(true);
    };

    const loadMedia = async () => {
      setIsReady(false);

      if (apod.media_type !== 'image') {
        show(apod.url);
        return;
      }

      const remoteUrl = pickDisplayUrl(apod, isSaveData());

      // 1. Try to get a cached blob from IndexedDB.
      let blob: Blob | null = null;
      try {
        blob = await getImageBlob(apod.date);
      } catch {
        // IndexedDB unavailable; the remote URL below is still a valid source.
      }

      // Safety: ensure blob is not empty (ORB check)
      if (!blob || blob.size <= 1024) {
        // Nothing cached: let the <img> load the remote URL directly. Remote
        // URLs cannot usefully be pre-decoded here — a failing decode would
        // just duplicate the network request and log a misleading error.
        show(remoteUrl);
        return;
      }

      const blobUrl = URL.createObjectURL(blob);

      // 2. Pre-decode the blob before revealing it. This catches corrupt or
      //    HTML error-page payloads cached by older versions.
      const img = new Image();
      img.src = blobUrl;

      try {
        await img.decode();
        if (isCancelled) {
          URL.revokeObjectURL(blobUrl);
          return;
        }
        objectUrl = blobUrl;
        show(blobUrl);
      } catch {
        URL.revokeObjectURL(blobUrl);
        // Purge the unusable entry so it is not retried on every new tab.
        void deleteImageBlob(apod.date).catch(() => {});
        show(remoteUrl);
      }
    };

    loadMedia();

    return () => {
      isCancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [apod]);

  const isLowRes =
    apod.width !== undefined &&
    apod.height !== undefined &&
    (apod.width < MIN_IMAGE_WIDTH || apod.height < MIN_IMAGE_HEIGHT);

  if (apod.media_type !== 'image') {
    return (
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
        <iframe
          src={`${apod.url}&autoplay=1&mute=1`}
          title={apod.title}
          className="w-full h-full border-none"
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
      <AnimatePresence>
        {isReady && imgUrl && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute inset-0 w-full h-full"
          >
            {isLowRes ? (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <img
                  src={imgUrl}
                  alt={apod.title}
                  className="max-w-full max-h-full object-contain rounded-sm shadow-2xl"
                  style={{ width: apod.width, maxHeight: '100vh' }}
                />
              </div>
            ) : (
              <img
                src={imgUrl}
                alt={apod.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
            )}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};
