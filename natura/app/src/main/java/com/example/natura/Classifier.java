package com.example.natura;

import android.content.Context;
import android.content.res.AssetFileDescriptor;
import android.graphics.Bitmap;

import org.tensorflow.lite.Interpreter;
import org.tensorflow.lite.support.common.FileUtil;
import org.tensorflow.lite.support.common.ops.NormalizeOp;
import org.tensorflow.lite.support.image.ImageProcessor;
import org.tensorflow.lite.support.image.TensorImage;
import org.tensorflow.lite.support.image.ops.ResizeOp;
import org.tensorflow.lite.support.label.TensorLabel;
import org.tensorflow.lite.support.tensorbuffer.TensorBuffer;

import java.io.FileInputStream;
import java.io.IOException;
import java.nio.MappedByteBuffer;
import java.nio.channels.FileChannel;
import java.util.List;
import java.util.Map;

public class Classifier {

    private Interpreter interpreter;
    private final List<String> labels;
    private static final int INPUT_SIZE = 224; 

    public Classifier(Context context, String modelPath, String labelPath) throws IOException {
        interpreter = new Interpreter(loadModelFile(context, modelPath));
        labels = FileUtil.loadLabels(context, labelPath);
    }

    private MappedByteBuffer loadModelFile(Context context, String modelPath) throws IOException {
        try (AssetFileDescriptor fileDescriptor = context.getAssets().openFd(modelPath);
             FileInputStream inputStream = new FileInputStream(fileDescriptor.getFileDescriptor());
             FileChannel fileChannel = inputStream.getChannel()) {
            return fileChannel.map(FileChannel.MapMode.READ_ONLY, fileDescriptor.getStartOffset(), fileDescriptor.getDeclaredLength());
        }
    }

    public Recognition recognizeImage(Bitmap bitmap) {
        TensorImage tensorImage = new TensorImage(interpreter.getInputTensor(0).dataType());
        tensorImage.load(bitmap);

        ImageProcessor imageProcessor = new ImageProcessor.Builder()
                .add(new ResizeOp(INPUT_SIZE, INPUT_SIZE, ResizeOp.ResizeMethod.BILINEAR))
                .add(new NormalizeOp(127.5f, 127.5f)) // Normalización estándar para Teachable Machine (-1 a 1)
                .build();

        tensorImage = imageProcessor.process(tensorImage);

        TensorBuffer probabilityBuffer = TensorBuffer.createFixedSize(
                interpreter.getOutputTensor(0).shape(),
                interpreter.getOutputTensor(0).dataType()
        );
        interpreter.run(tensorImage.getBuffer(), probabilityBuffer.getBuffer());

        Map<String, Float> labeledProbability = new TensorLabel(labels, probabilityBuffer).getMapWithFloatValue();
        
        Map.Entry<String, Float> maxEntry = null;
        for (Map.Entry<String, Float> entry : labeledProbability.entrySet()) {
            if (maxEntry == null || entry.getValue().compareTo(maxEntry.getValue()) > 0) {
                maxEntry = entry;
            }
        }

        if (maxEntry != null) {
            return new Recognition(maxEntry.getKey(), maxEntry.getValue() * 100);
        }
        return new Recognition("Desconocido", 0f);
    }

    public void close() {
        if (interpreter != null) {
            interpreter.close();
            interpreter = null;
        }
    }

    public static class Recognition {
        private final String title;
        private final Float confidence;

        public Recognition(String title, Float confidence) {
            this.title = title;
            this.confidence = confidence;
        }

        public String getTitle() { return title; }
        public Float getConfidence() { return confidence; }
    }
}
