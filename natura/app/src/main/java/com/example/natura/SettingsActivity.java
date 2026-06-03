package com.example.natura;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.app.AppCompatDelegate;

import com.google.android.material.switchmaterial.SwitchMaterial;

public class SettingsActivity extends AppCompatActivity {

    private TextView tvUserName, tvUserEmail;
    private Button btnChangePassword, btnLogout;
    private Button btnDisclaimer, btnPrivacy, btnAbout;
    private ImageButton btnBack;
    private RadioGroup rgTheme;
    private RadioButton rbLight, rbDark, rbSystem;
    private SwitchMaterial switchNotifications;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        androidx.activity.EdgeToEdge.enable(this);
        setContentView(R.layout.activity_settings);

        androidx.core.view.ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.mainSettings), (v, insets) -> {
            androidx.core.graphics.Insets systemBars = insets.getInsets(androidx.core.view.WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        // Inicializar vistas
        tvUserName = findViewById(R.id.tvUserNameSettings);
        tvUserEmail = findViewById(R.id.tvUserEmailSettings);
        btnChangePassword = findViewById(R.id.btnChangePassword);
        btnLogout = findViewById(R.id.btnLogout);
        btnBack = findViewById(R.id.btnBackSettings);
        rgTheme = findViewById(R.id.rgTheme);
        rbLight = findViewById(R.id.rbLight);
        rbDark = findViewById(R.id.rbDark);
        rbSystem = findViewById(R.id.rbSystem);
        switchNotifications = findViewById(R.id.switchNotifications);

        btnDisclaimer = findViewById(R.id.btnDisclaimer);
        btnPrivacy = findViewById(R.id.btnPrivacy);
        btnAbout = findViewById(R.id.btnAbout);

        // Cargar datos de perfil
        SharedPreferences pref = getSharedPreferences("sesion", Context.MODE_PRIVATE);
        tvUserName.setText(pref.getString("nombre_usuario", "Usuario"));
        tvUserEmail.setText(pref.getString("correo_usuario", "correo@ejemplo.com"));

        // Cargar tema guardado
        int savedTheme = pref.getInt("tema_app", AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM);
        if (savedTheme == AppCompatDelegate.MODE_NIGHT_NO) rbLight.setChecked(true);
        else if (savedTheme == AppCompatDelegate.MODE_NIGHT_YES) rbDark.setChecked(true);
        else rbSystem.setChecked(true);

        btnBack.setOnClickListener(v -> finish());
        btnLogout.setOnClickListener(v -> logout());

        // Lógica de cambio de tema
        rgTheme.setOnCheckedChangeListener((group, checkedId) -> {
            int mode;
            if (checkedId == R.id.rbLight) mode = AppCompatDelegate.MODE_NIGHT_NO;
            else if (checkedId == R.id.rbDark) mode = AppCompatDelegate.MODE_NIGHT_YES;
            else mode = AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM;

            // Guardar preferencia
            pref.edit().putInt("tema_app", mode).apply();
            // Aplicar inmediatamente
            AppCompatDelegate.setDefaultNightMode(mode);
        });

        switchNotifications.setOnCheckedChangeListener((buttonView, isChecked) -> {
            String msg = isChecked ? "Notificaciones activadas" : "Notificaciones desactivadas";
            Toast.makeText(this, msg, Toast.LENGTH_SHORT).show();
        });

        // Diálogos Legal
        btnDisclaimer.setOnClickListener(v -> showDialog("Aviso de Responsabilidad", "La información es informativa. Consulte a un médico."));
        btnPrivacy.setOnClickListener(v -> showDialog("Política de Privacidad", "Tus fotos se usan solo para el historial y no se comparten."));
        btnAbout.setOnClickListener(v -> showDialog("Acerca de Natura", "Natura v1.0.0\nGuía Botánica con IA."));
    }

    private void showDialog(String title, String message) {
        new AlertDialog.Builder(this)
                .setTitle(title)
                .setMessage(message)
                .setPositiveButton("Entendido", (dialog, which) -> dialog.dismiss())
                .show();
    }

    private void logout() {
        SharedPreferences preferences = getSharedPreferences("sesion", Context.MODE_PRIVATE);
        preferences.edit().clear().apply();
        Intent intent = new Intent(SettingsActivity.this, LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }
}
