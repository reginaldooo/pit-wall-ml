# Machine Learning, Deep Learning & NLP --- Technical Notes

**Learning roadmap · Applied AI Engineer · Version 1.0**

Catatan ini disusun dari fundamental sampai implementasi. Fokusnya bukan
sekadar menghafal definisi dan rumus, tetapi memahami kapan rumus
digunakan, bagaimana cara kerjanya, dan bagaimana implementasinya
menggunakan Python, PyTorch, dan TensorFlow.

---

## 1. Machine Learning (ML)

### 1.1 Apa itu Machine Learning?

Machine Learning adalah cabang Artificial Intelligence yang memungkinkan
komputer mempelajari pola dari data untuk membuat prediksi atau
keputusan tanpa harus diprogram secara eksplisit untuk setiap
kemungkinan.

Contoh:

- Bank memprediksi apakah seseorang berpotensi gagal membayar pinjaman.
- Fintech mendeteksi transaksi mencurigakan.
- E-commerce memprediksi produk yang mungkin dibeli pelanggan.
- Perusahaan memprediksi customer churn.

### 1.2 Cara kerja Machine Learning

1.  **Data Collection** --- mengumpulkan dataset.
2.  **Data Preprocessing** --- cleaning, encoding, normalization.
3.  **Model Training** --- model belajar dari data.
4.  **Model Evaluation** --- mengukur performa model.
5.  **Prediction / Deployment** --- model digunakan untuk data baru.

### 1.3 Jenis-jenis Machine Learning

#### A. Supervised Learning

Model belajar menggunakan data yang memiliki label (target).

Contoh:

| Input | Target |
| --- | --- |
| Usia, pendapatan, pekerjaan | Loan approved / rejected |
| Transaksi, nominal, waktu | Fraud / legitimate |
| Riwayat pelanggan | Churn / not churn |

Dua jenis utama:

- **Regression:** memprediksi nilai numerik.
- **Classification:** memprediksi kelas atau kategori.

Algoritma yang perlu dipahami:

| Algoritma | Kegunaan |
| --- | --- |
| Linear Regression | Prediksi nilai kontinu |
| Logistic Regression | Binary classification |
| Decision Tree | Pengambilan keputusan berbasis aturan |
| Random Forest | Ensemble beberapa decision tree |
| XGBoost | Gradient boosting |
| SVM | Classification dengan margin |
| KNN | Prediksi berdasarkan tetangga terdekat |
| Naive Bayes | Probabilistic classification |

#### B. Unsupervised Learning

Model belajar dari data tanpa label.

Contoh:

- Segmentasi pelanggan fintech.
- Mengelompokkan pengguna berdasarkan perilaku.
- Menemukan pola transaksi yang tidak biasa.

Algoritma:

- K-Means Clustering
- DBSCAN
- Hierarchical Clustering
- PCA (Principal Component Analysis)

#### C. Reinforcement Learning

Model belajar melalui interaksi dengan environment berdasarkan reward
dan punishment.

Contoh:

- Robot navigation.
- Game AI.
- Optimasi strategi pengambilan keputusan.

Konsep penting:

- Agent
- Environment
- State
- Action
- Reward
- Policy

### 1.4 Konsep penting dalam Machine Learning

#### Training, Validation, dan Testing

| Dataset | Fungsi |
| --- | --- |
| Training | Mengajarkan model |
| Validation | Memilih hyperparameter dan model |
| Testing | Mengukur performa pada data yang belum digunakan |

Contoh pembagian:

- 70% training
- 15% validation
- 15% testing

Pembagian ini bukan aturan mutlak; sesuaikan dengan ukuran dataset,
karakteristik data, dan kebutuhan evaluasi. Untuk data time-series,
gunakan pemisahan berdasarkan waktu, bukan random split biasa.

#### Overfitting

Model terlalu menghafal data training sehingga performanya buruk pada
data baru.

Ciri-ciri:

- Training accuracy tinggi.
- Validation accuracy rendah.

Solusi:

- Regularization.
- Cross-validation.
- Feature selection.
- Mengurangi kompleksitas model.
- Menambah data.
- Dropout untuk neural network.

#### Underfitting

Model terlalu sederhana sehingga tidak mampu mempelajari pola data.

Solusi:

- Menggunakan model lebih kompleks.
- Menambah fitur relevan.
- Mengurangi regularisasi berlebihan.
- Training lebih optimal.

---

## 2. Deep Learning (DL)

### 2.1 Apa itu Deep Learning?

Deep Learning merupakan bagian dari Machine Learning yang menggunakan
Artificial Neural Networks dengan banyak lapisan (layers) untuk
mempelajari pola kompleks dari data.

| Machine Learning | Deep Learning |
| --- | --- |
| Sering membutuhkan feature engineering manual | Dapat mempelajari fitur otomatis |
| Bisa bekerja baik dengan dataset kecil-menengah | Umumnya membutuhkan lebih banyak data |
| Banyak algoritma tradisional | Neural network dengan banyak layer |
| Training relatif ringan | Bisa membutuhkan GPU |

Contoh penggunaan:

- Face recognition.
- Speech recognition.
- Image classification.
- Natural Language Processing.
- Generative AI dan LLM.

### 2.2 Neural Network

Neural Network terinspirasi dari cara neuron biologis bekerja.

Struktur dasarnya:

1. **Input Layer:** menerima data.
2. **Hidden Layers:** mempelajari pola.
3. **Output Layer:** menghasilkan prediksi.

Setiap neuron melakukan operasi:

$$ z = Wx + b $$

$$ a = f(z) $$

Keterangan:

- (x): input.
- (W): weight.
- (b): bias.
- (f): activation function.
- (a): output neuron.

### 2.3 Activation Functions

Activation function memberikan kemampuan non-linear kepada neural
network.

| Function | Formula | Penggunaan |
| --- | --- | --- |
| ReLU | $\max(0,x)$ | Hidden layers |
| Sigmoid | $\frac{1}{1+e^{-x}}$ | Binary classification output |
| Tanh | $\tanh(x)$ | Hidden layers tertentu |
| Softmax | $\frac{e^{z_i}}{\sum_j e^{z_j}}$ | Multiclass output |

Hal yang perlu diingat:

- ReLU sering menjadi pilihan default untuk hidden layers.
- Sigmoid menghasilkan nilai antara 0 dan 1.
- Softmax mengubah logits menjadi distribusi probabilitas yang jumlahnya 1.

### 2.4 Forward Propagation dan Backpropagation

**Forward Propagation:** data bergerak dari input menuju output untuk
menghasilkan prediksi.

**Backpropagation:** model menghitung bagaimana error memengaruhi setiap
weight dan bias, menggunakan chain rule dari kalkulus. Kemudian
optimizer memperbarui parameter model untuk mengurangi error.

Siklus training:

1. Forward pass: hitung prediksi.
2. Hitung loss.
3. Backward pass: hitung gradient.
4. Optimizer step: perbarui parameter.

### 2.5 Loss Function

Loss function mengukur seberapa jauh prediksi model dari nilai
sebenarnya.

| Loss | Penggunaan |
| --- | --- |
| MSE | Regression |
| MAE | Regression |
| Binary Cross Entropy | Binary classification |
| Categorical Cross Entropy | Multiclass classification |
| Huber Loss | Regression yang lebih robust terhadap outlier |

### 2.6 Optimizer

Optimizer menentukan bagaimana parameter model diperbarui.

Yang paling penting:

- SGD (Stochastic Gradient Descent)
- Momentum
- RMSprop
- Adam
- AdamW

Adam dan AdamW sering digunakan sebagai optimizer awal untuk deep
learning. Pemilihan optimizer tetap perlu diuji berdasarkan model dan
dataset.

---

## 3. Natural Language Processing (NLP)

### 3.1 Apa itu NLP?

Natural Language Processing adalah bidang AI yang memungkinkan komputer
memahami, memproses, menganalisis, dan menghasilkan bahasa manusia.

Contoh penerapan:

- Chatbot customer service.
- Sentiment analysis.
- Spam detection.
- Text classification.
- Document summarization.
- Machine translation.
- Information extraction.
- Large Language Models.

### 3.2 NLP Pipeline

1.  **Raw Text:** teks mentah.
2.  **Text Cleaning:** menghilangkan noise dan normalisasi teks.
3.  **Tokenization:** memecah teks menjadi token.
4.  **Numerical Representation:** mengubah token menjadi angka atau
    vector.
5.  **Model Processing:** model mempelajari pola bahasa.
6.  **Prediction:** menghasilkan prediksi, misalnya sentiment positive.

### 3.3 Teknik NLP yang perlu dipahami

#### A. Text Preprocessing

1.  **Lowercasing:** mengubah teks menjadi huruf kecil.
2.  **Tokenization:** memecah kalimat menjadi token.
3.  **Stopword removal:** menghapus kata umum jika relevan.
4.  **Stemming:** mengubah kata menjadi bentuk dasar berdasarkan aturan.
5.  **Lemmatization:** mengubah kata menjadi bentuk lemma.
6.  **Padding:** menyamakan panjang sequence.
7.  **Truncation:** membatasi panjang sequence.

Contoh:

Input: `The customers are buying products`

Tokenization: `["The", "customers", "are", "buying", "products"]`

Catatan: preprocessing tidak selalu harus menghapus stopword atau
melakukan stemming. Untuk model Transformer modern, preprocessing
berlebihan dapat menghilangkan informasi yang berguna. Ikuti kebutuhan
model dan karakteristik bahasa.

#### B. Text Representation

Komputer tidak memahami kata secara langsung. Teks harus
direpresentasikan sebagai angka.

| Metode | Penjelasan |
| --- | --- |
| Bag of Words | Menghitung kemunculan kata |
| TF-IDF | Mengukur pentingnya kata |
| Word2Vec | Mempelajari representasi kata |
| GloVe | Word embedding berbasis statistik |
| FastText | Embedding dengan subword |
| BERT Embedding | Contextual word representation |

Contoh TF-IDF:

$$ TFIDF(t,d)=TF(t,d)\times IDF(t) $$

$$ IDF(t)=\log\frac{N}{DF(t)} $$

Keterangan:

- (N): jumlah seluruh dokumen.
- (DF(t)): jumlah dokumen yang mengandung term tersebut.

Intuisinya: kata yang sering muncul dalam sebuah dokumen tetapi jarang
muncul di seluruh dokumen memiliki nilai TF-IDF tinggi.

### 3.4 Word Embedding

Word embedding mengubah kata menjadi vector numerik berdimensi tertentu.

Contoh ilustrasi:

$$ King=[0.2,0.8,0.4] $$

$$ Queen=[0.3,0.9,0.5] $$

Kata-kata dengan konteks atau makna serupa cenderung memiliki
representasi vector yang berdekatan.

Yang perlu dipahami:

- Vector representation.
- Vector similarity.
- Cosine similarity.
- Word2Vec.
- Contextual embedding.

Cosine similarity:

$$ \text{cosine}(A,B)=\frac{A\cdot B}{|A||B|} $$

Nilainya berkisar antara -1 sampai 1.

### 3.5 RNN, LSTM, GRU, dan Transformer

Ini adalah arsitektur Deep Learning untuk pemrosesan sequence.

#### RNN (Recurrent Neural Network)

Memproses sequence dengan mempertahankan hidden state dari langkah
sebelumnya.

Kelemahan: sulit mempelajari dependensi jangka panjang karena
vanishing/exploding gradients.

#### LSTM

Menggunakan gates untuk mengatur informasi yang disimpan dan dilupakan.

Cocok untuk sequence data dan time-series tertentu.

#### GRU

Versi lebih sederhana dari LSTM dengan update gate dan reset gate.

#### Transformer

Menggunakan attention mechanism untuk mempelajari hubungan antar-token
tanpa pemrosesan recurrent secara berurutan.

Menjadi fondasi BERT, GPT, dan banyak LLM modern.

### 3.6 Attention Mechanism

Attention memungkinkan model menentukan bagian mana dari input yang
paling relevan ketika memproses suatu token.

Formula Scaled Dot-Product Attention:

$$ Attention(Q,K,V)=Softmax\left(\frac{QK^T}{\sqrt{d_k}}\right)V $$

Keterangan:

- **Q = Query:** informasi yang sedang dicari.
- **K = Key:** informasi yang tersedia untuk dicocokkan.
- **V = Value:** informasi yang akan diambil.
- (d_k): dimensi Key.

### 3.7 BERT vs GPT

| BERT | GPT |
| --- | --- |
| Encoder-based | Decoder-based |
| Bidirectional context | Autoregressive context |
| Kuat untuk representasi dan pemahaman teks | Kuat untuk text generation |
| Masked Language Modeling | Next-token prediction |

Contoh aplikasi:

- **BERT:** sentiment classification, semantic understanding.
- **GPT:** chatbot, content generation, dan berbagai tugas generatif.

---

## 4. PyTorch

### 4.1 Apa itu PyTorch?

PyTorch adalah framework open-source untuk membangun dan melatih neural
network menggunakan Python.

PyTorch populer untuk research, experimentation, dan pengembangan model
deep learning.

Konsep utama:

- Tensor.
- Autograd.
- Neural Network.
- Dataset dan DataLoader.
- Loss Function.
- Optimizer.
- GPU acceleration.

### 4.2 Tensor

Tensor adalah struktur data multidimensi.

| Struktur | Contoh |
| --- | --- |
| Scalar | 5 |
| Vector | [1, 2, 3] |
| Matrix | [[1,2],[3,4]] |
| 3D Tensor | Batch image |
| 4D Tensor | Batch of images |

Contoh implementasi:

``` python
import torch

x = torch.tensor([1, 2, 3])

print(x)
print(x.shape)
print(x.dtype)
```

### 4.3 Membuat Neural Network

``` python
import torch
import torch.nn as nn

class NeuralNetwork(nn.Module):
    def __init__(self):
        super().__init__()

        self.layers = nn.Sequential(
            nn.Linear(10, 64),
            nn.ReLU(),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, 1)
        )

    def forward(self, x):
        return self.layers(x)

model = NeuralNetwork()
```

Penjelasan:

- `nn.Module`: base class neural network.
- `nn.Linear`: fully connected layer.
- `nn.ReLU`: activation function.
- `forward()`: alur forward propagation.

### 4.4 Training Loop

Ini salah satu bagian yang wajib dikuasai.

``` python
import torch
import torch.nn as nn

model = NeuralNetwork()

criterion = nn.MSELoss()
optimizer = torch.optim.Adam(
    model.parameters(),
    lr=0.001
)

for epoch in range(100):

    # Forward pass
    predictions = model(X_train)

    # Calculate loss
    loss = criterion(predictions, y_train)

    # Reset gradients
    optimizer.zero_grad()

    # Backpropagation
    loss.backward()

    # Update weights
    optimizer.step()

    print(epoch, loss.item())
```

Empat langkah paling penting:

| Code | Fungsi |
| --- | --- |
| `model(X)` | Forward propagation |
| `criterion()` | Menghitung loss |
| `loss.backward()` | Menghitung gradient |
| `optimizer.step()` | Memperbarui parameter |

`optimizer.zero_grad()` diperlukan karena PyTorch secara default
mengakumulasi gradient.

Catatan implementasi:

- Pastikan `X_train` dan `y_train` memiliki tipe data dan shape yang sesuai.
- Untuk classification, pilih loss yang sesuai, misalnya `nn.CrossEntropyLoss()` untuk multiclass classification dengan logits.
- Training loop di atas adalah ilustrasi sederhana; implementasi nyata biasanya memakai mini-batches melalui `DataLoader`, validation loop, dan checkpointing.

### 4.5 Hal lain yang wajib dipahami

- `model.train()`: mengaktifkan training behavior.
- `model.eval()`: mengaktifkan evaluation behavior.
- `torch.no_grad()`: menonaktifkan gradient tracking.
- `Dataset`: mendefinisikan cara mengakses data.
- `DataLoader`: mengatur batching dan loading data.
- `model.to(device)`: memindahkan model ke CPU atau GPU.

---

## 5. TensorFlow dan Keras

### 5.1 Apa itu TensorFlow?

TensorFlow adalah framework Machine Learning dan Deep Learning dari
Google untuk training, deployment, dan production ML.

TensorFlow memiliki high-level API bernama Keras yang mempermudah
pembangunan neural network.

### 5.2 Membuat Neural Network dengan Keras

``` python
import tensorflow as tf
from tensorflow import keras

model = keras.Sequential([
    keras.layers.Input(shape=(10,)),
    keras.layers.Dense(64, activation="relu"),
    keras.layers.Dense(32, activation="relu"),
    keras.layers.Dense(1)
])

model.compile(
    optimizer="adam",
    loss="mse",
    metrics=["mae"]
)

model.fit(
    X_train,
    y_train,
    epochs=100,
    batch_size=32,
    validation_data=(X_val, y_val)
)
```

### 5.3 Evaluasi dan Prediksi

``` python
results = model.evaluate(X_test, y_test)

predictions = model.predict(X_test)
```

### 5.4 PyTorch vs TensorFlow

| Aspek | PyTorch | TensorFlow/Keras |
| --- | --- | --- |
| Bahasa | Python | Python |
| Model building | `nn.Module` | Keras API |
| Training | Manual training loop umum | `model.fit()` |
| Autograd | Built-in | GradientTape |
| Flexibility | Sangat fleksibel | Fleksibel |
| Deployment | TorchServe dan ekosistem lain | TF Serving, TFLite, dan lainnya |
| Research | Sangat populer | Juga digunakan |

**Mana yang harus dipelajari dulu?**

Rekomendasi: pelajari PyTorch terlebih dahulu, kemudian pahami
Keras/TensorFlow pada level dasar.

PyTorch membantu memahami proses training secara eksplisit, termasuk
gradient, backpropagation, dan optimizer. Setelah memahami konsepnya,
berpindah framework lebih mudah.

---

## 6. Rumus Matematika yang Wajib Dikuasai

Kamu tidak harus menghafal semua rumus matematika, tetapi harus memahami
rumus yang sering muncul saat implementasi ML dan DL.

### 6.1 Linear Algebra

Linear Algebra merupakan fondasi dari hampir semua operasi Machine
Learning dan Deep Learning.

#### A. Dot Product

$$ A\cdot B=\sum_{i=1}^{n}a_ib_i $$

Penggunaan:

- Linear Regression.
- Neural Network.
- Similarity calculation.
- Attention mechanism.

Contoh:

``` python
import numpy as np

a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

result = np.dot(a, b)
```

#### B. Matrix Multiplication

$$ C=AB $$

Jika:

$$ A_{m\times n}, B_{n\times p} $$

Maka:

$$ C_{m\times p} $$

Penggunaan:

- Neural network.
- Batch processing.
- Transformer.
- Linear layers.

#### C. Transpose

$$ A^T $$

Menukar baris menjadi kolom dan sebaliknya.

#### D. Eigenvalues dan Eigenvectors

$$ Av=\lambda v $$

Penting untuk:

- PCA.
- Dimensionality reduction.
- Analisis struktur matriks.

#### E. Norm

$$ |x|_2=\sqrt{\sum_i x_i^2} $$

Penggunaan:

- Mengukur magnitude vector.
- Regularization.
- Cosine similarity.

### 6.2 Calculus

Calculus diperlukan untuk memahami bagaimana model belajar.

#### A. Derivative

$$ f'(x)=\frac{df}{dx} $$

Mengukur perubahan fungsi terhadap perubahan input.

#### B. Partial Derivative

$$ \frac{\partial L}{\partial w} $$

Mengukur perubahan loss terhadap satu parameter tertentu. Ini sangat
penting dalam neural network.

#### C. Chain Rule

$$ \frac{dL}{dx}=\frac{dL}{dy}\times\frac{dy}{dx} $$

Digunakan dalam backpropagation.

#### D. Gradient

$$
\nabla f(x)=
\begin{bmatrix}
\frac{\partial f}{\partial x_1}\\
\frac{\partial f}{\partial x_2}
\end{bmatrix}
$$

Gradient menunjukkan arah perubahan terbesar suatu fungsi.

### 6.3 Probability dan Statistics

Sangat penting untuk ML, NLP, dan khususnya use case fintech.

#### A. Mean

$$ \mu=\frac{1}{n}\sum_{i=1}^{n}x_i $$

#### B. Variance

$$ \sigma^2=\frac{1}{n}\sum_{i=1}^{n}(x_i-\mu)^2 $$

Untuk sample variance, denominator biasanya (n-1).

#### C. Standard Deviation

$$ \sigma=\sqrt{\sigma^2} $$

#### D. Probability

$$ P(A)=\frac{\text{Favorable outcomes}}{\text{Total outcomes}} $$

#### E. Conditional Probability

$$ P(A|B)=\frac{P(A\cap B)}{P(B)} $$

#### F. Bayes' Theorem

$$ P(A|B)=\frac{P(B|A)P(A)}{P(B)} $$

Digunakan dalam:

- Naive Bayes.
- Probabilistic modeling.
- Fraud detection.
- Risk analysis.

#### G. Normal Distribution

$$ f(x)=\frac{1}{\sigma\sqrt{2\pi}}e^{-\frac{(x-\mu)^2}{2\sigma^2}} $$

Pahami konsep bell curve, mean, dan standard deviation.

### 6.4 Optimization

Optimization adalah proses mencari parameter terbaik untuk meminimalkan
loss function.

#### Gradient Descent

$$ w_{new}=w_{old}-\alpha\nabla L(w) $$

Keterangan:

- (w): parameter model.
- $\alpha$: learning rate.
- $\nabla L$: gradient loss.

**Learning Rate**

- Terlalu besar: training bisa tidak stabil.
- Terlalu kecil: training bisa sangat lambat.

### 6.5 Rumus Machine Learning yang Sering Diimplementasikan

#### A. Linear Regression

$$ \hat y=wx+b $$

#### B. Mean Squared Error

$$ MSE=\frac{1}{n}\sum_{i=1}^{n}(y_i-\hat y_i)^2 $$

#### C. Mean Absolute Error

$$ MAE=\frac{1}{n}\sum_{i=1}^{n}|y_i-\hat y_i| $$

#### D. Logistic Regression

$$ P(y=1|x)=\frac{1}{1+e^{-z}} $$

Dengan:

$$ z=w^Tx+b $$

#### E. Binary Cross Entropy

$$ L=-\frac{1}{N}\sum_{i=1}^{N}[y_i\log(p_i)+(1-y_i)\log(1-p_i)] $$

#### F. Softmax

$$ P(y_i)=\frac{e^{z_i}}{\sum_j e^{z_j}} $$

#### G. Regularization

L1:

$$ L_{total}=L+\lambda\sum_i|w_i| $$

L2:

$$ L_{total}=L+\lambda\sum_iw_i^2 $$

Tujuannya mengontrol kompleksitas model dan mengurangi overfitting.

### 6.6 Rumus Evaluasi Model

| Metric | Formula | Penggunaan |
| --- | --- | --- |
| Accuracy | $\frac{TP+TN}{TP+TN+FP+FN}$ | Klasifikasi |
| Precision | $\frac{TP}{TP+FP}$ | Mengurangi false positive |
| Recall | $\frac{TP}{TP+FN}$ | Mengurangi false negative |
| F1 Score | $2\frac{PR}{P+R}$ | Keseimbangan precision-recall |
| RMSE | $\sqrt{MSE}$ | Regression |
| R² | $1-\frac{SS_{res}}{SS_{tot}}$ | Regression |

Keterangan:

- TP: True Positive.
- TN: True Negative.
- FP: False Positive.
- FN: False Negative.

**Contoh fintech:**

Dalam fraud detection, accuracy bukan selalu metric terbaik.

Misalnya:

- 99% transaksi normal.
- 1% transaksi fraud.

Model yang selalu memprediksi transaksi normal bisa mendapatkan accuracy
99%, tetapi gagal mendeteksi fraud.

Karena itu, precision, recall, F1-score, PR-AUC, dan biaya kesalahan
prediksi perlu dipertimbangkan.

---

## 7. Matematika yang Harus Dikuasai

Berikut urutan prioritas belajar matematika untuk menjadi Applied ML/AI
Engineer.

### 1. Linear Algebra --- Prioritas tinggi

Fondasi representasi dan operasi data.

Materi:

- Scalar, vector, matrix, tensor.
- Matrix multiplication.
- Dot product.
- Transpose.
- Matrix inverse.
- Eigenvalues dan eigenvectors.
- Norm dan vector similarity.

### 2. Calculus --- Prioritas tinggi

Fondasi proses training neural network.

Materi:

- Functions.
- Limits.
- Derivatives.
- Partial derivatives.
- Chain rule.
- Gradient.
- Gradient descent.

### 3. Probability & Statistics --- Prioritas tinggi

Fondasi analisis data dan prediksi.

Materi:

- Mean, median, mode.
- Variance dan standard deviation.
- Probability.
- Conditional probability.
- Bayes theorem.
- Normal distribution.
- Sampling.
- Hypothesis testing.
- Correlation dan covariance.

### 4. Optimization --- Penting

Materi:

- Gradient descent.
- SGD.
- Momentum.
- Adam.
- Learning rate.
- Convex dan non-convex optimization.

### 5. Discrete Mathematics --- Pendukung

Materi:

- Set theory.
- Logic.
- Combinatorics.
- Graph theory.
- Basic combinatorial probability.

**Kesimpulan matematika:** kalau waktu terbatas, fokuskan pada:

1. Matrix dan vector operations.
2. Derivatives dan chain rule.
3. Probability dan distributions.
4. Statistics dan hypothesis testing.
5. Gradient descent dan optimization.

Kamu tidak perlu menjadi ahli matematika murni. Targetnya adalah mampu
membaca, memahami, dan mengimplementasikan konsep matematika dalam model
ML.

---

## 8. Library dan Tools yang Perlu Dikuasai

| Library | Fungsi |
| --- | --- |
| NumPy | Numerical computation |
| Pandas | Data manipulation |
| Matplotlib | Data visualization |
| Seaborn | Statistical visualization |
| Scikit-learn | Traditional ML |
| PyTorch | Deep Learning |
| TensorFlow/Keras | Deep Learning |
| Hugging Face Transformers | NLP dan pretrained models |
| NLTK | NLP preprocessing |
| spaCy | NLP processing |
| XGBoost | Gradient boosting |
| Optuna | Hyperparameter optimization |

Untuk Applied AI Engineer, prioritaskan:

- Python.
- NumPy dan Pandas.
- Scikit-learn.
- PyTorch.
- Hugging Face.
- Basic model deployment menggunakan FastAPI.

---

## 9. Implementasi yang Harus Bisa Dilakukan

Membaca teori saja tidak cukup. Kamu perlu mampu membuat implementasi
dari awal sampai evaluasi.

| Skill | Target kemampuan |
| --- | --- |
| Data preprocessing | Cleaning, encoding, scaling |
| EDA | Distribution, correlation, outlier |
| Feature engineering | Membuat fitur relevan |
| Classification | Logistic Regression, Random Forest |
| Regression | Linear Regression, XGBoost |
| Evaluation | Confusion matrix, F1, ROC-AUC |
| Neural network | Membuat model dengan PyTorch |
| Training | Loss, optimizer, backpropagation |
| NLP | Tokenization, embeddings |
| Transformer | Menggunakan pretrained BERT |
| Fine-tuning | Melatih pretrained model pada dataset |
| Deployment | Membuat inference API |

---

## 10. Mini Project untuk Menguji Pemahaman

Tiga proyek berikut saling melengkapi, terutama untuk Applied AI
Engineer dan use case fintech.

### Project 1 --- Credit Risk Prediction

**Fokus:** Machine Learning

- Prediksi risiko gagal bayar.
- Logistic Regression.
- Random Forest / XGBoost.
- ROC-AUC, Precision, Recall.
- Explainability menggunakan SHAP.

### Project 2 --- Fraud Detection

**Fokus:** Machine Learning + Deep Learning

- Deteksi transaksi fraud.
- Imbalanced dataset handling.
- Isolation Forest.
- Neural Network.
- Precision-Recall evaluation.

### Project 3 --- Financial Sentiment Analysis

**Fokus:** NLP + Deep Learning

- Analisis sentimen review aplikasi finansial.
- Text preprocessing.
- TF-IDF + Logistic Regression.
- Fine-tuning BERT.
- Perbandingan performa kedua model.

---

## 11. Cheat Sheet: Rumus yang Wajib Diingat

| Konsep | Rumus |
| --- | --- |
| Linear Regression | $\hat y=wx+b$ |
| Sigmoid | $\frac{1}{1+e^{-x}}$ |
| Softmax | $\frac{e^{z_i}}{\sum_j e^{z_j}}$ |
| ReLU | $\max(0,x)$ |
| MSE | $\frac{1}{n}\sum(y-\hat y)^2$ |
| MAE | $\frac{1}{n}\sum_{i=1}^{n}\vert y_i-\hat y_i\vert$ |
| Gradient Descent | $w-\alpha\nabla L(w)$ |
| Bayes | $\frac{P(B\vert A)P(A)}{P(B)}$ |
| TF-IDF | $TF\times IDF$ |
| Cosine Similarity | $\frac{A\cdot B}{\vert A\vert \vert B\vert }$ |
| Attention | $Softmax(\frac{QK^T}{\sqrt{d_k}})V$ |
| Precision | $\frac{TP}{TP+FP}$ |
| Recall | $\frac{TP}{TP+FN}$ |
| F1 Score | $2\frac{PR}{P+R}$ |

---

## 12. Checklist Belajar

Gunakan checklist ini untuk mengukur penguasaan materi. Centang ketika
kamu bisa menjelaskan dan mengimplementasikannya, bukan hanya setelah
membaca.

### Machine Learning

- [ ] Memahami supervised, unsupervised, reinforcement learning
- [ ] Memahami regression dan classification
- [ ] Mengimplementasikan Logistic Regression
- [ ] Mengimplementasikan Random Forest dan XGBoost
- [ ] Memahami overfitting dan underfitting
- [ ] Memahami train, validation, test split
- [ ] Menguasai model evaluation

### Deep Learning

- [ ] Memahami neural network architecture
- [ ] Memahami forward propagation
- [ ] Memahami backpropagation
- [ ] Memahami activation functions
- [ ] Memahami loss functions
- [ ] Memahami optimizers
- [ ] Membuat neural network sendiri

### NLP

- [ ] Memahami tokenization dan preprocessing
- [ ] Memahami Bag of Words dan TF-IDF
- [ ] Memahami word embeddings
- [ ] Memahami RNN, LSTM, dan GRU
- [ ] Memahami Transformer dan attention
- [ ] Memahami BERT dan GPT
- [ ] Melakukan fine-tuning pretrained model

### Framework

- [ ] Memahami Tensor dan Tensor Operations
- [ ] Membuat model dengan PyTorch
- [ ] Menulis training loop PyTorch
- [ ] Menggunakan Dataset dan DataLoader
- [ ] Membuat model menggunakan Keras
- [ ] Melakukan model evaluation dan inference

### Mathematics

- [ ] Linear algebra dan matrix operations
- [ ] Derivative dan partial derivative
- [ ] Chain rule dan gradient
- [ ] Probability dan Bayes theorem
- [ ] Statistics dan distributions
- [ ] Gradient descent dan optimization

---

## 13. Urutan Belajar yang Direkomendasikan

Jangan mempelajari semuanya sekaligus. Urutan berikut membangun
pemahaman secara bertahap.

| Minggu | Fokus |
| --- | --- |
| 1 | ML fundamentals + Statistics |
| 2 | Linear Algebra + Calculus |
| 3 | Classical ML + Scikit-learn |
| 4 | Deep Learning + Neural Network |
| 5 | PyTorch + Training Loop |
| 6 | NLP fundamentals + Embeddings |
| 7 | Transformer + Hugging Face |
| 8 | Project end-to-end + Deployment |

### Prinsip untuk Applied AI Engineer

Kamu harus bisa menjawab tiga pertanyaan:

1.  **Why this model?** --- Mengapa memilih algoritma atau arsitektur
    tersebut?
2.  **How does it work?** --- Bagaimana model mempelajari pola dari
    data?
3.  **How do you evaluate it?** --- Bagaimana membuktikan model bekerja
    dengan baik?

Kamu tidak harus menghafal semua formula di luar kepala. Namun, kamu
harus mampu menjelaskan intuisi matematikanya, menentukan kapan formula
digunakan, dan mengimplementasikannya dengan Python.

Itulah perbedaan antara seseorang yang hanya bisa menggunakan library ML
dengan seseorang yang benar-benar memahami Machine Learning.
