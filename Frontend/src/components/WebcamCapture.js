import React, { useRef, useEffect, useCallback, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import "./WebcamCapture.css";

const MODEL_URL = "/facialjs/models";

const WebcamCapture = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const loadModels = async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
      await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);
      console.log("All models loaded");
      setModelsLoaded(true);
    } catch (error) {
      console.error("Error loading models", error);
    }
  };

  const detect = useCallback(async () => {
    if (
      webcamRef.current &&
      webcamRef.current.video.readyState === 4 &&
      modelsLoaded
    ) {
      const video = webcamRef.current.video;

      console.log("Video Dimensions: ", video.videoWidth, video.videoHeight);

      if (video.videoWidth > 0 && video.videoHeight > 0) {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions()
          .withAgeAndGender();

        const canvas = canvasRef.current;
        const displaySize = {
          width: video.videoWidth,
          height: video.videoHeight,
        };

        faceapi.matchDimensions(canvas, displaySize);
        const resizedDetections = faceapi.resizeResults(
          detections,
          displaySize
        );

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Effacer le canevas avant de dessiner

        resizedDetections.forEach((detection) => {
          const { x, y, width, height } = detection.detection.box;
          ctx.strokeStyle = "red";
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, width, height);

          const { age, gender, expressions } = detection;
          const drawText = (text, x, y) => {
            ctx.font = "16px Arial";
            ctx.fillStyle = "red";
            ctx.fillText(text, x, y);
          };

          drawText(`Age: ${Math.round(age)}`, x, y - 20);
          drawText(`Gender: ${gender}`, x, y - 40);
          drawText(
            `Expressions: ${Object.keys(expressions)
              .map((e) => `${e}: ${Math.round(expressions[e] * 100) / 100}`)
              .join(", ")}`,
            x,
            y - 60
          );
        });
      } else {
        console.error("Invalid video dimensions");
      }
    }
  }, [webcamRef, modelsLoaded]);

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    if (modelsLoaded) {
      const interval = setInterval(() => {
        detect();
      }, 100);
      return () => clearInterval(interval);
    }
  }, [detect, modelsLoaded]);

  return (
    <div className="container">
      <div className="webcam-wrapper">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width="100%"
          height="100%"
        />
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default WebcamCapture;
