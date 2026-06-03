package com.example.natura;

import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.util.Base64;
import android.util.Log;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class ResultActivity extends AppCompatActivity implements TextToSpeech.OnInitListener {

    private ImageView ivResultImage;
    private TextView tvPlantName, tvScientificName, tvConfidence;
    private TextView tvDescription, tvProperties, tvTraditionalUses, tvWarnings;
    private ImageButton btnBack;
    private FloatingActionButton btnSpeak;

    private String currentPlantId = "";
    private String currentImageBase64 = "";
    private TextToSpeech textToSpeech;

    // Usando la configuración global
    private static final String URL_BUSCAR_PLANTA = Config.BASE_URL + "buscar_planta.php?etiqueta=";
    private static final String URL_GUARDAR_HISTORIAL = Config.BASE_URL + "guardar_historial.php";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        androidx.activity.EdgeToEdge.enable(this);
        setContentView(R.layout.activity_result);

        // Ajustes de UI y Sistema para evitar solapamiento con barras del sistema
        getWindow().setNavigationBarColor(androidx.core.content.ContextCompat.getColor(this, R.color.nature_bg));
        androidx.core.view.ViewCompat.setOnApplyWindowInsetsListener(findViewById(android.R.id.content), (v, insets) -> {
            androidx.core.graphics.Insets systemBars = insets.getInsets(androidx.core.view.WindowInsetsCompat.Type.systemBars());
            v.setPadding(0, 0, 0, systemBars.bottom);
            return insets;
        });

        // Inicializar vistas
        ivResultImage = findViewById(R.id.ivResultImage);
        tvPlantName = findViewById(R.id.tvPlantName);
        tvScientificName = findViewById(R.id.tvScientificName);
        tvConfidence = findViewById(R.id.tvConfidence);
        tvDescription = findViewById(R.id.tvDescriptionResult);
        tvProperties = findViewById(R.id.tvProperties);
        tvTraditionalUses = findViewById(R.id.tvTraditionalUses);
        tvWarnings = findViewById(R.id.tvWarnings);
        btnBack = findViewById(R.id.btnBackResult);
        btnSpeak = findViewById(R.id.btnSpeak);

        // Deshabilitar botón hasta que el motor TTS esté listo (como en el código del compañero)
        btnSpeak.setEnabled(false);

        // Inicializar el motor de Text-to-Speech
        textToSpeech = new TextToSpeech(this, this);

        btnBack.setOnClickListener(v -> finish());
        
        btnSpeak.setOnClickListener(v -> {
            String textoParaLeer = "Nombre: " + tvPlantName.getText().toString() + ". " +
                                "Nombre científico: " + tvScientificName.getText().toString() + ". " +
                                "Descripción: " + tvDescription.getText().toString() + ". " +
                                "Propiedades: " + tvProperties.getText().toString() + ". " +
                                "Usos tradicionales: " + tvTraditionalUses.getText().toString() + ". " +
                                "Advertencias: " + tvWarnings.getText().toString();
            
            if (!textoParaLeer.isEmpty()) {
                leerTexto(textoParaLeer);
            } else {
                Toast.makeText(this, "No hay información para leer", Toast.LENGTH_SHORT).show();
            }
        });

        // Manejar datos recibidos
        String plantLabel = getIntent().getStringExtra("plant_name"); 
        String confidence = getIntent().getStringExtra("confidence");
        byte[] byteArray = getIntent().getByteArrayExtra("image_bytes");

        if (confidence != null) tvConfidence.setText("IA: " + confidence);
        else tvConfidence.setText("Búsqueda Manual");

        if (byteArray != null) {
            Bitmap bitmap = BitmapFactory.decodeByteArray(byteArray, 0, byteArray.length);
            ivResultImage.setImageBitmap(bitmap);
            currentImageBase64 = Base64.encodeToString(byteArray, Base64.DEFAULT);
        } else {
            ivResultImage.setImageResource(R.drawable.logo1);
        }

        boolean isFromHistory = getIntent().getBooleanExtra("from_history", false);
        boolean isSearchByName = getIntent().getBooleanExtra("search_by_name", false);

        if (plantLabel != null) {
            buscarYGuardarEnBaseDeDatos(plantLabel.toLowerCase().trim(), !isFromHistory, isSearchByName);
        }
    }

    private void leerTexto(String texto) {
        if (textToSpeech != null) {
            // QUEUE_FLUSH: corta el audio actual y reinicia si se presiona varias veces
            textToSpeech.speak(texto, TextToSpeech.QUEUE_FLUSH, null, "ID_TTS_PROTOTIPO");
        }
    }

    @Override
    public void onInit(int status) {
        if (status == TextToSpeech.SUCCESS) {
            // Configurar idioma español
            int result = textToSpeech.setLanguage(new Locale("es", "ES"));

            if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                Log.e("TTS", "El idioma español no está disponible en este dispositivo.");
                Toast.makeText(this, "Idioma español no soportado", Toast.LENGTH_SHORT).show();
            } else {
                // Habilitar el botón si la inicialización fue exitosa
                btnSpeak.setEnabled(true);
                // Ajustes para que suene un poco más natural (opcional)
                textToSpeech.setPitch(1.0f);
                textToSpeech.setSpeechRate(0.9f);
            }
        } else {
            Log.e("TTS", "Error al inicializar TextToSpeech.");
            Toast.makeText(this, "Error al iniciar motor de voz", Toast.LENGTH_SHORT).show();
        }
    }

    private void buscarYGuardarEnBaseDeDatos(String etiquetaOriginal, boolean permitirGuardar, boolean porNombre) {
        final String etiqueta = etiquetaOriginal.matches("^\\d+\\s+.*") ? etiquetaOriginal.replaceFirst("^\\d+\\s+", "") : etiquetaOriginal;
        RequestQueue queue = Volley.newRequestQueue(this);
        String url;
        try {
            String encoded = java.net.URLEncoder.encode(etiqueta, "UTF-8").replace("+", "%20");
            url = porNombre ? Config.URL_BUSCAR_NOMBRE + encoded : URL_BUSCAR_PLANTA + encoded;
        } catch (Exception e) {
            url = porNombre ? Config.URL_BUSCAR_NOMBRE + etiqueta : URL_BUSCAR_PLANTA + etiqueta;
        }

        JsonObjectRequest jsonRequest = new JsonObjectRequest(Request.Method.GET, url, null,
                response -> {
                    try {
                        if (!response.has("error")) {
                            tvPlantName.setText(response.getString("nombre_comun"));
                            tvScientificName.setText(response.getString("nombre_cientifico"));
                            tvDescription.setText(response.getString("descripcion"));
                            tvProperties.setText(response.getString("propiedades"));
                            tvTraditionalUses.setText(response.getString("usos_tradicionales"));
                            tvWarnings.setText(response.getString("advertencias"));
                            currentPlantId = response.getString("id_planta");
                            if (permitirGuardar) ejecutarGuardadoHistorial();
                        } else {
                            tvPlantName.setText(etiqueta);
                            Toast.makeText(this, "No en la DB", Toast.LENGTH_SHORT).show();
                        }
                    } catch (JSONException e) { e.printStackTrace(); }
                },
                error -> Log.e("DB_ERROR", "Fallo conexión")
        );
        queue.add(jsonRequest);
    }

    private void ejecutarGuardadoHistorial() {
        SharedPreferences pref = getSharedPreferences("sesion", Context.MODE_PRIVATE);
        String idUsuario = pref.getString("id_usuario", "0");
        String confianza = tvConfidence.getText().toString().replace("IA: ", "").replace("%", "").trim();

        if (idUsuario.equals("0")) return;

        StringRequest stringRequest = new StringRequest(Request.Method.POST, URL_GUARDAR_HISTORIAL,
                response -> Log.d("HISTORIAL", "Éxito"),
                error -> Log.e("HISTORIAL", "Fallo")) {
            @Override
            protected Map<String, String> getParams() {
                Map<String, String> params = new HashMap<>();
                params.put("id_usuario", idUsuario);
                params.put("id_planta", currentPlantId);
                params.put("foto", currentImageBase64);
                params.put("confianza", confianza); 
                return params;
            }
        };
        Volley.newRequestQueue(this).add(stringRequest);
    }

    @Override
    protected void onDestroy() {
        // Liberar correctamente los recursos al cerrar la app (como en el código del compañero)
        if (textToSpeech != null) {
            textToSpeech.stop();
            textToSpeech.shutdown();
        }
        super.onDestroy();
    }
}
