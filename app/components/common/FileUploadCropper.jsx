"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const INITIAL_CROP = { x: 0.1, y: 0.1, width: 0.8, height: 0.8 };
const RESIZE_HANDLES = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function canvasToFile(canvas, filename) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("The cropped image could not be created."));
          return;
        }

        resolve(
          new File([blob], filename, {
            type: "image/jpeg",
            lastModified: Date.now(),
          }),
        );
      },
      "image/jpeg",
      0.92,
    );
  });
}

export default function FileUploadCropper({
  show,
  sourceFile,
  sourceUrl = "",
  defaultImage = "",
  cropType = "freesize",
  onCropDone,
  onCancel,
}) {
  const [crop, setCrop] = useState(INITIAL_CROP);
  const [imageReady, setImageReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const imageRef = useRef(null);
  const imageStageRef = useRef(null);
  const interactionRef = useRef(null);

  useEffect(() => {
    if (!show) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !processing) onCancel?.();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel, processing, show]);

  if (!show) return null;

  const startInteraction = (event, action) => {
    if (!imageReady || processing) return;

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    interactionRef.current = {
      action,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      crop: { ...crop },
    };
  };

  const handlePointerMove = (event) => {
    const interaction = interactionRef.current;
    const stage = imageStageRef.current;
    if (!interaction || !stage || interaction.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    const bounds = stage.getBoundingClientRect();
    const dx = (event.clientX - interaction.startX) / bounds.width;
    const dy = (event.clientY - interaction.startY) / bounds.height;
    const original = interaction.crop;
    const minimumWidth = Math.min(0.12, 48 / bounds.width);
    const minimumHeight = Math.min(0.12, 48 / bounds.height);

    if (interaction.action === "move") {
      setCrop({
        ...original,
        x: clamp(original.x + dx, 0, 1 - original.width),
        y: clamp(original.y + dy, 0, 1 - original.height),
      });
      return;
    }

    let left = original.x;
    let top = original.y;
    let right = original.x + original.width;
    let bottom = original.y + original.height;
    const action = interaction.action;

    if (action.includes("w")) {
      left = clamp(original.x + dx, 0, right - minimumWidth);
    }
    if (action.includes("e")) {
      right = clamp(right + dx, left + minimumWidth, 1);
    }
    if (action.includes("n")) {
      top = clamp(original.y + dy, 0, bottom - minimumHeight);
    }
    if (action.includes("s")) {
      bottom = clamp(bottom + dy, top + minimumHeight, 1);
    }

    setCrop({ x: left, y: top, width: right - left, height: bottom - top });
  };

  const stopInteraction = (event) => {
    if (interactionRef.current?.pointerId === event.pointerId) {
      interactionRef.current = null;
    }
  };

  const handleCrop = async () => {
    const image = imageRef.current;
    if (!image || !imageReady || processing) return;

    try {
      setProcessing(true);
      setError("");

      const sourceX = Math.round(crop.x * image.naturalWidth);
      const sourceY = Math.round(crop.y * image.naturalHeight);
      const sourceWidth = Math.max(1, Math.round(crop.width * image.naturalWidth));
      const sourceHeight = Math.max(
        1,
        Math.round(crop.height * image.naturalHeight),
      );
      const canvas = document.createElement("canvas");
      canvas.width = sourceWidth;
      canvas.height = sourceHeight;
      const context = canvas.getContext("2d");

      if (!context) throw new Error("Image cropping is not supported.");

      context.fillStyle = "#fff";
      context.fillRect(0, 0, sourceWidth, sourceHeight);
      context.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        sourceWidth,
        sourceHeight,
      );

      const originalName = sourceFile?.name || "identification-document";
      const baseName = originalName.replace(/\.[^.]+$/, "") || "document";
      const croppedFile = await canvasToFile(
        canvas,
        `${baseName}-cropped.jpg`,
      );

      if (croppedFile.size > MAX_FILE_SIZE) {
        throw new Error("The cropped document must be 5 MB or smaller.");
      }

      await onCropDone?.(croppedFile);
    } catch (cropError) {
      setError(cropError?.message || "The image could not be cropped.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show" />
      <div
        className="modal fade show file-upload-cropper-modal"
        style={{ display: "block" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="file-upload-cropper-title"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header service-wizard-header">
              <h5 className="modal-title" id="file-upload-cropper-title">
                Crop Identification Document
              </h5>
              <button
                type="button"
                className="cropper-close-button"
                aria-label="Close cropper"
                onClick={onCancel}
                disabled={processing}
              >
                <X aria-hidden="true" size={24} />
              </button>
            </div>

            <div className="modal-body file-upload-cropper-body">
              <p className="file-upload-cropper-help">
                Drag the crop area and resize it from any edge or corner.
              </p>

              {sourceUrl || defaultImage ? (
                <div
                  className="file-upload-cropper-stage"
                  ref={imageStageRef}
                  onPointerMove={handlePointerMove}
                  onPointerUp={stopInteraction}
                  onPointerCancel={stopInteraction}
                >
                  {/* A blob URL is required because this image has not been uploaded. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imageRef}
                    className="file-upload-cropper-image"
                    src={sourceUrl || defaultImage}
                    alt="Identification document selected for cropping"
                    draggable="false"
                    onLoad={() => setImageReady(true)}
                  />

                  {imageReady && (
                    <div
                      className="file-upload-cropper-selection"
                      style={{
                        left: `${crop.x * 100}%`,
                        top: `${crop.y * 100}%`,
                        width: `${crop.width * 100}%`,
                        height: `${crop.height * 100}%`,
                      }}
                      onPointerDown={(event) => startInteraction(event, "move")}
                      data-crop-type={cropType}
                    >
                      {RESIZE_HANDLES.map((handle) => (
                        <span
                          key={handle}
                          className={`file-upload-cropper-handle handle-${handle}`}
                          onPointerDown={(event) => startInteraction(event, handle)}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-danger">No image is available to crop.</p>
              )}

              {error && (
                <p className="text-danger mt-3 mb-0" role="alert">
                  {error}
                </p>
              )}
            </div>

            <div className="modal-footer file-upload-cropper-actions">
              <button
                type="button"
                className="btn btn-outline-dark"
                onClick={onCancel}
                disabled={processing}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-wizard-primary"
                onClick={handleCrop}
                disabled={!imageReady || processing}
              >
                {processing ? "Cropping..." : "Crop & Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
