package com.wm.mushaf   // غيّر الاسم ليطابق مشروعك

import android.Manifest
import android.content.ContentValues
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.provider.MediaStore
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.util.Base64
import android.webkit.*
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {
    private lateinit var web: WebView
    private var sr: SpeechRecognizer? = null

    // ضع هنا رابط موقعك https
    private val URL = "https://YOUR-DOMAIN/index.html"

    override fun onCreate(b: Bundle?) {
        super.onCreate(b)
        web = WebView(this).also { setContentView(it) }
        web.settings.apply {
            javaScriptEnabled = true; domStorageEnabled = true
            mediaPlaybackRequiresUserGesture = false
        }
        web.webChromeClient = object : WebChromeClient() {
            override fun onPermissionRequest(r: PermissionRequest) = runOnUiThread { r.grant(r.resources) }
        }
        web.addJavascriptInterface(Speech(), "AndroidSpeech")
        web.addJavascriptInterface(Bridge(), "AndroidBridge")
        web.loadUrl(URL)
    }

    private fun js(code: String) = runOnUiThread { web.evaluateJavascript(code, null) }

    inner class Speech {
        @JavascriptInterface fun start(lang: String) = runOnUiThread {
            if (ContextCompat.checkSelfPermission(this@MainActivity, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this@MainActivity, arrayOf(Manifest.permission.RECORD_AUDIO), 1)
                js("onNativeSpeechError('perm')"); return@runOnUiThread
            }
            sr?.destroy()
            sr = SpeechRecognizer.createSpeechRecognizer(this@MainActivity).apply {
                setRecognitionListener(object : RecognitionListener {
                    override fun onPartialResults(p: Bundle) = send(p, false)
                    override fun onResults(r: Bundle) = send(r, true)
                    override fun onError(e: Int) = js(if (e == SpeechRecognizer.ERROR_NETWORK) "onNativeSpeechError('net')" else "onNativeSpeechError('none')")
                    override fun onReadyForSpeech(p: Bundle?) {}
                    override fun onBeginningOfSpeech() {}
                    override fun onRmsChanged(v: Float) {}
                    override fun onBufferReceived(b: ByteArray?) {}
                    override fun onEndOfSpeech() {}
                    override fun onEvent(t: Int, p: Bundle?) {}
                    fun send(x: Bundle, fin: Boolean) {
                        val t = x.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)?.firstOrNull() ?: ""
                        js("onNativeSpeech(${org.json.JSONObject.quote(t)},$fin)")
                    }
                })
                startListening(Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang)
                    putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                })
            }
        }
        @JavascriptInterface fun stop() = runOnUiThread { sr?.stopListening() }
    }

    inner class Bridge {
        @JavascriptInterface fun saveImage(base64: String, name: String): Boolean = try {
            val v = ContentValues().apply {
                put(MediaStore.Images.Media.DISPLAY_NAME, name)
                put(MediaStore.Images.Media.MIME_TYPE, "image/png")
                put(MediaStore.Images.Media.RELATIVE_PATH, "Pictures/المصحف المعلم")
            }
            val uri = contentResolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, v)!!
            contentResolver.openOutputStream(uri)!!.use { it.write(Base64.decode(base64, Base64.DEFAULT)) }
            runOnUiThread { Toast.makeText(this@MainActivity, "تم حفظ الشهادة في المعرض", Toast.LENGTH_LONG).show() }
            true
        } catch (e: Exception) { false }
    }
}
