package com.example.natura;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Log;
import android.widget.ImageButton;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.camera.core.CameraSelector;
import androidx.camera.core.ImageCapture;
import androidx.camera.core.ImageCaptureException;
import androidx.camera.core.ImageProxy;
import androidx.camera.core.Preview;
import androidx.camera.lifecycle.ProcessCameraProvider;
import androidx.camera.view.PreviewView;
import androidx.core.content.ContextCompat;

import com.google.common.util.concurrent.ListenableFuture;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.util.concurrent.ExecutionException;

public class CameraActivity extends AppCompatActivity {

    private PreviewView viewFinder;
    private ImageButton btnGallery, btnClose;
    private com.google.android.material.floatingactionbutton.FloatingActionButton btnCapture;
    private ImageCapture imageCapture;
    private Classifier classifier;

    private final ActivityResultLauncher<String> requestPermissionLauncher =
            registerForActivityResult(new ActivityResultContracts.RequestPermission(), isGranted -> {
                if (isGranted) {
                    startCamera();
                } else {
                    Toast.makeText(this, "Permiso de cámara denegado", Toast.LENGTH_SHORT).show();
                    finish();
                }
            });

    private final ActivityResultLauncher<Intent> pickImageLauncher =
            registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> {
                if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                    Uri imageUri = result.getData().getData();
                    try {
                        // Forma moderna y segura de cargar imágenes de la galería
                        InputStream inputStream = getContentResolver().openInputStream(imageUri);
                        Bitmap bitmap = BitmapFactory.decodeStream(inputStream);
                        if (bitmap != null) {
                            procesarReconocimiento(bitmap);
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                        Toast.makeText(this, "No se pudo cargar la imagen", Toast.LENGTH_SHORT).show();
                    }
                }
            });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        androidx.activity.EdgeToEdge.enable(this);
        setContentView(R.layout.activity_camera);

        // Ajuste de padding para no tapar la barra de notificaciones
        androidx.core.view.ViewCompat.setOnApplyWindowInsetsListener(findViewById(android.R.id.content), (v, insets) -> {
            androidx.core.graphics.Insets systemBars = insets.getInsets(androidx.core.view.WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        try {
            classifier = new Classifier(this, "model_unquant.tflite", "labels.txt");
        } catch (java.io.IOException e) {
            Log.e("IA_PLANTAS", "Error al cargar modelo TFLite: " + e.getMessage());
            Toast.makeText(this, "Error: IA no lista", Toast.LENGTH_LONG).show();
        }

        viewFinder = findViewById(R.id.viewFinder);
        btnGallery = findViewById(R.id.btnGallery);
        btnCapture = findViewById(R.id.btnCapture);
        btnClose = findViewById(R.id.btnClose);

        btnClose.setOnClickListener(v -> finish());

        btnGallery.setOnClickListener(v -> {
            Intent intent = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
            pickImageLauncher.launch(intent);
        });

        btnCapture.setOnClickListener(v -> takePhoto());

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            startCamera();
        } else {
            requestPermissionLauncher.launch(Manifest.permission.CAMERA);
        }
    }

    private void takePhoto() {
        if (imageCapture == null) return;

        btnCapture.setEnabled(false); // Evitar múltiples clics
        Toast.makeText(this, "Analizando planta...", Toast.LENGTH_SHORT).show();

        imageCapture.takePicture(ContextCompat.getMainExecutor(this), new ImageCapture.OnImageCapturedCallback() {
            @Override
            public void onCaptureSuccess(@NonNull ImageProxy image) {
                Bitmap bitmap = imageProxyToBitmap(image);
                image.close();
                if (bitmap != null) {
                    procesarReconocimiento(bitmap);
                }
                btnCapture.setEnabled(true);
            }

            @Override
            public void onError(@NonNull ImageCaptureException exception) {
                Log.e("IA_PLANTAS", "Error al capturar: " + exception.getMessage());
                Toast.makeText(CameraActivity.this, "Error al capturar foto", Toast.LENGTH_SHORT).show();
                btnCapture.setEnabled(true);
            }
        });
    }

    private Bitmap imageProxyToBitmap(ImageProxy image) {
        ByteBuffer buffer = image.getPlanes()[0].getBuffer();
        byte[] bytes = new byte[buffer.remaining()];
        buffer.get(bytes);
        return BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
    }

    public void procesarReconocimiento(Bitmap bitmap) {
        if (classifier == null) {
            Toast.makeText(this, "Modelo de IA no cargado", Toast.LENGTH_SHORT).show();
            return;
        }

        // 1. Inferencia local
        Classifier.Recognition recognition = classifier.recognizeImage(bitmap);

        // 2. OPTIMIZACIÓN: Redimensionar imagen para evitar crash por peso
        // La IA ya analizó la imagen original, ahora la achicamos solo para mostrarla en la UI
        Bitmap resizedBitmap = Bitmap.createScaledBitmap(bitmap, 640, 640 * bitmap.getHeight() / bitmap.getWidth(), false);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        resizedBitmap.compress(Bitmap.CompressFormat.JPEG, 70, outputStream);
        byte[] bytes = outputStream.toByteArray();

        // 3. Abrir pantalla de resultados
        Intent intent = new Intent(CameraActivity.this, ResultActivity.class);
        intent.putExtra("plant_name", recognition.getTitle());
        intent.putExtra("confidence", String.format("%.1f%%", recognition.getConfidence()));
        intent.putExtra("image_bytes", bytes);
        startActivity(intent);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (classifier != null) { classifier.close(); }
    }

    private void startCamera() {
        ListenableFuture<ProcessCameraProvider> cameraProviderFuture = ProcessCameraProvider.getInstance(this);
        cameraProviderFuture.addListener(() -> {
            try {
                ProcessCameraProvider cameraProvider = cameraProviderFuture.get();
                Preview preview = new Preview.Builder().build();
                preview.setSurfaceProvider(viewFinder.getSurfaceProvider());
                imageCapture = new ImageCapture.Builder().setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY).build();
                CameraSelector cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA;
                cameraProvider.unbindAll();
                cameraProvider.bindToLifecycle(this, cameraSelector, preview, imageCapture);
            } catch (ExecutionException | InterruptedException e) {
                Toast.makeText(this, "Error al iniciar cámara", Toast.LENGTH_SHORT).show();
            }
        }, ContextCompat.getMainExecutor(this));
    }
}
