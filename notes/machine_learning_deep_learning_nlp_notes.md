# Machine Learning, Deep Learning & NLP: Technical Notes

**Learning roadmap · Applied AI Engineer · Version 1.0**

These notes go from fundamentals to implementation. The focus is not on
memorising definitions and formulas, but on understanding when a formula
is used, how it works, and how to implement it with Python, PyTorch, and
TensorFlow.

---

## 1. Machine Learning (ML)

### 1.1 What is Machine Learning?

Machine Learning is a branch of Artificial Intelligence that lets
computers learn patterns from data to make predictions or decisions
without being explicitly programmed for every possibility.

Examples:

- A bank predicts whether someone is likely to default on a loan.
- A fintech detects suspicious transactions.
- An e-commerce site predicts which products a customer may buy.
- A company predicts customer churn.

### 1.2 How Machine Learning works

1. **Data Collection:** gather the dataset.
2. **Data Preprocessing:** cleaning, encoding, normalization.
3. **Model Training:** the model learns from the data.
4. **Model Evaluation:** measure the model's performance.
5. **Prediction / Deployment:** the model is used on new data.

### 1.3 Types of Machine Learning

#### A. Supervised Learning

The model learns from data that has labels (targets).

Examples:

| Input | Target |
| --- | --- |
| Age, income, occupation | Loan approved / rejected |
| Transaction, amount, time | Fraud / legitimate |
| Customer history | Churn / not churn |

Two main types:

- **Regression:** predicts a numeric value.
- **Classification:** predicts a class or category.

Algorithms to know:

| Algorithm | Use |
| --- | --- |
| Linear Regression | Predicting continuous values |
| Logistic Regression | Binary classification |
| Decision Tree | Rule-based decision making |
| Random Forest | Ensemble of several decision trees |
| XGBoost | Gradient boosting |
| SVM | Classification with a margin |
| KNN | Prediction based on the nearest neighbours |
| Naive Bayes | Probabilistic classification |

#### B. Unsupervised Learning

The model learns from data without labels.

Examples:

- Segmenting fintech customers.
- Grouping users by behaviour.
- Finding unusual transaction patterns.

Algorithms:

- K-Means Clustering
- DBSCAN
- Hierarchical Clustering
- PCA (Principal Component Analysis)

#### C. Reinforcement Learning

The model learns by interacting with an environment, based on rewards
and punishments.

Examples:

- Robot navigation.
- Game AI.
- Optimizing decision-making strategies.

Key concepts:

- Agent
- Environment
- State
- Action
- Reward
- Policy

### 1.4 Key concepts in Machine Learning

#### Training, Validation, and Testing

| Dataset | Purpose |
| --- | --- |
| Training | Teaches the model |
| Validation | Chooses hyperparameters and models |
| Testing | Measures performance on data not used before |

Example split:

- 70% training
- 15% validation
- 15% testing

This split is not an absolute rule; adjust it to the dataset size, the
characteristics of the data, and the evaluation needs. For time-series
data, split by time instead of using an ordinary random split.

#### Overfitting

The model memorises the training data, so it performs poorly on new
data.

Signs:

- High training accuracy.
- Low validation accuracy.

Solutions:

- Regularization.
- Cross-validation.
- Feature selection.
- Reduce model complexity.
- Add more data.
- Dropout for neural networks.

#### Underfitting

The model is too simple to learn the patterns in the data.

Solutions:

- Use a more complex model.
- Add relevant features.
- Reduce excessive regularization.
- Train more effectively.

---

## 2. Deep Learning (DL)

### 2.1 What is Deep Learning?

Deep Learning is a part of Machine Learning that uses Artificial Neural
Networks with many layers to learn complex patterns from data.

| Machine Learning | Deep Learning |
| --- | --- |
| Often needs manual feature engineering | Can learn features automatically |
| Can work well with small to medium datasets | Usually needs much more data |
| Many traditional algorithms | Neural networks with many layers |
| Training is relatively light | May need a GPU |

Example uses:

- Face recognition.
- Speech recognition.
- Image classification.
- Natural Language Processing.
- Generative AI and LLMs.

### 2.2 Neural Network

A neural network is inspired by how biological neurons work.

Basic structure:

1. **Input Layer:** receives the data.
2. **Hidden Layers:** learn the patterns.
3. **Output Layer:** produces the prediction.

Each neuron performs the operations:

$$ z = Wx + b $$

$$ a = f(z) $$

Where:

- $x$: input.
- $W$: weights.
- $b$: bias.
- $f$: activation function.
- $a$: neuron output.

### 2.3 Activation Functions

An activation function gives the neural network non-linear capability.

| Function | Formula | Use |
| --- | --- | --- |
| ReLU | $\max(0,x)$ | Hidden layers |
| Sigmoid | $\frac{1}{1+e^{-x}}$ | Binary classification output |
| Tanh | $\tanh(x)$ | Some hidden layers |
| Softmax | $\frac{e^{z_i}}{\sum_j e^{z_j}}$ | Multiclass output |

Things to remember:

- ReLU is often the default choice for hidden layers.
- Sigmoid outputs values between 0 and 1.
- Softmax turns logits into a probability distribution that sums to 1.

### 2.4 Forward Propagation and Backpropagation

**Forward Propagation:** data moves from the input to the output to
produce a prediction.

**Backpropagation:** the model computes how the error affects each
weight and bias, using the chain rule from calculus. The optimizer then
updates the model parameters to reduce the error.

The training cycle:

1. Forward pass: compute the prediction.
2. Compute the loss.
3. Backward pass: compute the gradients.
4. Optimizer step: update the parameters.

### 2.5 Loss Function

A loss function measures how far the model's prediction is from the
true value.

| Loss | Use |
| --- | --- |
| MSE | Regression |
| MAE | Regression |
| Binary Cross Entropy | Binary classification |
| Categorical Cross Entropy | Multiclass classification |
| Huber Loss | Regression that is more robust to outliers |

### 2.6 Optimizer

An optimizer determines how the model parameters are updated.

The most important ones:

- SGD (Stochastic Gradient Descent)
- Momentum
- RMSprop
- Adam
- AdamW

Adam and AdamW are often used as the first optimizer for deep learning.
The choice of optimizer should still be tested against the model and
the dataset.

---

## 3. Natural Language Processing (NLP)

### 3.1 What is NLP?

Natural Language Processing is the field of AI that lets computers
understand, process, analyse, and generate human language.

Example applications:

- Customer service chatbots.
- Sentiment analysis.
- Spam detection.
- Text classification.
- Document summarization.
- Machine translation.
- Information extraction.
- Large Language Models.

### 3.2 NLP Pipeline

1. **Raw Text:** the unprocessed text.
2. **Text Cleaning:** remove noise and normalise the text.
3. **Tokenization:** split the text into tokens.
4. **Numerical Representation:** turn tokens into numbers or vectors.
5. **Model Processing:** the model learns language patterns.
6. **Prediction:** produce a prediction, for example positive sentiment.

### 3.3 NLP techniques to understand

#### A. Text Preprocessing

1. **Lowercasing:** convert the text to lowercase.
2. **Tokenization:** split a sentence into tokens.
3. **Stopword removal:** remove common words when relevant.
4. **Stemming:** reduce a word to its base form using rules.
5. **Lemmatization:** reduce a word to its lemma.
6. **Padding:** make sequences the same length.
7. **Truncation:** limit the sequence length.

Example:

Input: `The customers are buying products`

Tokenization: `["The", "customers", "are", "buying", "products"]`

Note: preprocessing does not always have to remove stopwords or apply
stemming. For modern Transformer models, too much preprocessing can
remove useful information. Follow the needs of the model and the
characteristics of the language.

#### B. Text Representation

Computers do not understand words directly. Text must be represented as
numbers.

| Method | Description |
| --- | --- |
| Bag of Words | Counts word occurrences |
| TF-IDF | Measures how important a word is |
| Word2Vec | Learns word representations |
| GloVe | Statistics-based word embeddings |
| FastText | Embeddings with subwords |
| BERT Embedding | Contextual word representation |

TF-IDF example:

$$ TFIDF(t,d)=TF(t,d)\times IDF(t) $$

$$ IDF(t)=\log\frac{N}{DF(t)} $$

Where:

- $N$: the total number of documents.
- $DF(t)$: the number of documents that contain the term.

The intuition: a word that appears often in one document but rarely
across all documents has a high TF-IDF value.

### 3.4 Word Embedding

A word embedding turns a word into a numeric vector with a certain
number of dimensions.

Illustrative example:

$$ King=[0.2,0.8,0.4] $$

$$ Queen=[0.3,0.9,0.5] $$

Words with similar context or meaning tend to have vector
representations that are close together.

What to understand:

- Vector representation.
- Vector similarity.
- Cosine similarity.
- Word2Vec.
- Contextual embedding.

Cosine similarity:

$$ \text{cosine}(A,B)=\frac{A\cdot B}{\|A\|\|B\|} $$

Its value ranges from -1 to 1.

### 3.5 RNN, LSTM, GRU, and Transformer

These are Deep Learning architectures for processing sequences.

#### RNN (Recurrent Neural Network)

Processes a sequence while keeping the hidden state from the previous
step.

Weakness: it struggles to learn long-term dependencies because of
vanishing/exploding gradients.

#### LSTM

Uses gates to control which information is kept and which is forgotten.

Suitable for sequence data and certain time-series.

#### GRU

A simpler version of the LSTM with an update gate and a reset gate.

#### Transformer

Uses the attention mechanism to learn relationships between tokens
without sequential recurrent processing.

It is the foundation of BERT, GPT, and many modern LLMs.

### 3.6 Attention Mechanism

Attention lets the model decide which parts of the input are most
relevant when processing a given token.

The Scaled Dot-Product Attention formula:

$$ Attention(Q,K,V)=Softmax\left(\frac{QK^T}{\sqrt{d_k}}\right)V $$

Where:

- **Q = Query:** the information being looked for.
- **K = Key:** the information available to be matched.
- **V = Value:** the information that will be retrieved.
- $d_k$: the dimension of the Key.

### 3.7 BERT vs GPT

| BERT | GPT |
| --- | --- |
| Encoder-based | Decoder-based |
| Bidirectional context | Autoregressive context |
| Strong at representation and text understanding | Strong at text generation |
| Masked Language Modeling | Next-token prediction |

Example applications:

- **BERT:** sentiment classification, semantic understanding.
- **GPT:** chatbots, content generation, and many generative tasks.

---

## 4. PyTorch

### 4.1 What is PyTorch?

PyTorch is an open-source framework for building and training neural
networks in Python.

PyTorch is popular for research, experimentation, and developing deep
learning models.

Main concepts:

- Tensor.
- Autograd.
- Neural Network.
- Dataset and DataLoader.
- Loss Function.
- Optimizer.
- GPU acceleration.

### 4.2 Tensor

A tensor is a multidimensional data structure.

| Structure | Example |
| --- | --- |
| Scalar | 5 |
| Vector | [1, 2, 3] |
| Matrix | [[1,2],[3,4]] |
| 3D Tensor | Batch of images |
| 4D Tensor | Batches of images |

Implementation example:

``` python
import torch

x = torch.tensor([1, 2, 3])

print(x)
print(x.shape)
print(x.dtype)
```

### 4.3 Building a Neural Network

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

Explanation:

- `nn.Module`: the base class for neural networks.
- `nn.Linear`: a fully connected layer.
- `nn.ReLU`: an activation function.
- `forward()`: the forward propagation flow.

### 4.4 Training Loop

This is one of the parts you must master.

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

The four most important steps:

| Code | Purpose |
| --- | --- |
| `model(X)` | Forward propagation |
| `criterion()` | Computes the loss |
| `loss.backward()` | Computes the gradients |
| `optimizer.step()` | Updates the parameters |

`optimizer.zero_grad()` is needed because PyTorch accumulates gradients
by default.

Implementation notes:

- Make sure `X_train` and `y_train` have the right data type and shape.
- For classification, choose a suitable loss, for example `nn.CrossEntropyLoss()` for multiclass classification with logits.
- The training loop above is a simple illustration; a real implementation usually uses mini-batches through a `DataLoader`, a validation loop, and checkpointing.

### 4.5 Other things you must understand

- `model.train()`: enables training behaviour.
- `model.eval()`: enables evaluation behaviour.
- `torch.no_grad()`: disables gradient tracking.
- `Dataset`: defines how the data is accessed.
- `DataLoader`: handles batching and loading data.
- `model.to(device)`: moves the model to the CPU or GPU.

---

## 5. TensorFlow and Keras

### 5.1 What is TensorFlow?

TensorFlow is a Machine Learning and Deep Learning framework from
Google for training, deployment, and production ML.

TensorFlow has a high-level API called Keras that makes building neural
networks easier.

### 5.2 Building a Neural Network with Keras

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

### 5.3 Evaluation and Prediction

``` python
results = model.evaluate(X_test, y_test)

predictions = model.predict(X_test)
```

### 5.4 PyTorch vs TensorFlow

| Aspect | PyTorch | TensorFlow/Keras |
| --- | --- | --- |
| Language | Python | Python |
| Model building | `nn.Module` | Keras API |
| Training | Manual training loop is common | `model.fit()` |
| Autograd | Built-in | GradientTape |
| Flexibility | Very flexible | Flexible |
| Deployment | TorchServe and other ecosystems | TF Serving, TFLite, and others |
| Research | Very popular | Also used |

**Which should you learn first?**

Recommendation: learn PyTorch first, then understand Keras/TensorFlow
at a basic level.

PyTorch helps you understand the training process explicitly, including
gradients, backpropagation, and the optimizer. Once you understand the
concepts, switching frameworks is easier.

---

## 6. Mathematical Formulas You Must Master

You do not need to memorise every mathematical formula, but you must
understand the formulas that appear often when implementing ML and DL.

### 6.1 Linear Algebra

Linear Algebra is the foundation of almost every Machine Learning and
Deep Learning operation.

#### A. Dot Product

$$ A\cdot B=\sum_{i=1}^{n}a_ib_i $$

Used in:

- Linear Regression.
- Neural Networks.
- Similarity calculation.
- Attention mechanism.

Example:

``` python
import numpy as np

a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

result = np.dot(a, b)
```

#### B. Matrix Multiplication

$$ C=AB $$

If:

$$ A_{m\times n}, B_{n\times p} $$

Then:

$$ C_{m\times p} $$

Used in:

- Neural networks.
- Batch processing.
- Transformers.
- Linear layers.

#### C. Transpose

$$ A^T $$

Swaps rows and columns.

#### D. Eigenvalues and Eigenvectors

$$ Av=\lambda v $$

Important for:

- PCA.
- Dimensionality reduction.
- Analysing matrix structure.

#### E. Norm

$$ \|x\|_2=\sqrt{\sum_i x_i^2} $$

Used for:

- Measuring the magnitude of a vector.
- Regularization.
- Cosine similarity.

### 6.2 Calculus

Calculus is needed to understand how a model learns.

#### A. Derivative

$$ f'(x)=\frac{df}{dx} $$

Measures how a function changes when the input changes.

#### B. Partial Derivative

$$ \frac{\partial L}{\partial w} $$

Measures how the loss changes with respect to one specific parameter.
This is very important in neural networks.

#### C. Chain Rule

$$ \frac{dL}{dx}=\frac{dL}{dy}\times\frac{dy}{dx} $$

Used in backpropagation.

#### D. Gradient

$$
\nabla f(x)=
\begin{bmatrix}
\frac{\partial f}{\partial x_1}\\
\frac{\partial f}{\partial x_2}
\end{bmatrix}
$$

The gradient shows the direction of the greatest increase of a
function.

### 6.3 Probability and Statistics

Very important for ML, NLP, and especially fintech use cases.

#### A. Mean

$$ \mu=\frac{1}{n}\sum_{i=1}^{n}x_i $$

#### B. Variance

$$ \sigma^2=\frac{1}{n}\sum_{i=1}^{n}(x_i-\mu)^2 $$

For the sample variance, the denominator is usually $n-1$.

#### C. Standard Deviation

$$ \sigma=\sqrt{\sigma^2} $$

#### D. Probability

$$ P(A)=\frac{\text{Favorable outcomes}}{\text{Total outcomes}} $$

#### E. Conditional Probability

$$ P(A|B)=\frac{P(A\cap B)}{P(B)} $$

#### F. Bayes' Theorem

$$ P(A|B)=\frac{P(B|A)P(A)}{P(B)} $$

Used in:

- Naive Bayes.
- Probabilistic modeling.
- Fraud detection.
- Risk analysis.

#### G. Normal Distribution

$$ f(x)=\frac{1}{\sigma\sqrt{2\pi}}e^{-\frac{(x-\mu)^2}{2\sigma^2}} $$

Understand the concept of the bell curve, the mean, and the standard
deviation.

### 6.4 Optimization

Optimization is the process of finding the best parameters to minimise
the loss function.

#### Gradient Descent

$$ w_{new}=w_{old}-\alpha\nabla L(w) $$

Where:

- $w$: the model parameters.
- $\alpha$: the learning rate.
- $\nabla L$: the gradient of the loss.

**Learning Rate**

- Too large: training can become unstable.
- Too small: training can be very slow.

### 6.5 ML Formulas Often Implemented

#### A. Linear Regression

$$ \hat y=wx+b $$

#### B. Mean Squared Error

$$ MSE=\frac{1}{n}\sum_{i=1}^{n}(y_i-\hat y_i)^2 $$

#### C. Mean Absolute Error

$$ MAE=\frac{1}{n}\sum_{i=1}^{n}|y_i-\hat y_i| $$

#### D. Logistic Regression

$$ P(y=1|x)=\frac{1}{1+e^{-z}} $$

With:

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

The goal is to control model complexity and reduce overfitting.

### 6.6 Model Evaluation Formulas

| Metric | Formula | Use |
| --- | --- | --- |
| Accuracy | $\frac{TP+TN}{TP+TN+FP+FN}$ | Classification |
| Precision | $\frac{TP}{TP+FP}$ | Reducing false positives |
| Recall | $\frac{TP}{TP+FN}$ | Reducing false negatives |
| F1 Score | $2\frac{PR}{P+R}$ | Balance of precision and recall |
| RMSE | $\sqrt{MSE}$ | Regression |
| R² | $1-\frac{SS_{res}}{SS_{tot}}$ | Regression |

Where:

- TP: True Positive.
- TN: True Negative.
- FP: False Positive.
- FN: False Negative.

**Fintech example:**

In fraud detection, accuracy is not always the best metric.

For example:

- 99% of transactions are normal.
- 1% of transactions are fraud.

A model that always predicts a normal transaction can reach 99%
accuracy, yet fail to detect any fraud.

That is why precision, recall, F1-score, PR-AUC, and the cost of
prediction errors need to be considered.

---

## 7. Mathematics You Must Master

Here is the order of priority for studying mathematics to become an
Applied ML/AI Engineer.

### 1. Linear Algebra (high priority)

The foundation for representing and operating on data.

Topics:

- Scalar, vector, matrix, tensor.
- Matrix multiplication.
- Dot product.
- Transpose.
- Matrix inverse.
- Eigenvalues and eigenvectors.
- Norm and vector similarity.

### 2. Calculus (high priority)

The foundation of how neural networks are trained.

Topics:

- Functions.
- Limits.
- Derivatives.
- Partial derivatives.
- Chain rule.
- Gradient.
- Gradient descent.

### 3. Probability & Statistics (high priority)

The foundation of data analysis and prediction.

Topics:

- Mean, median, mode.
- Variance and standard deviation.
- Probability.
- Conditional probability.
- Bayes theorem.
- Normal distribution.
- Sampling.
- Hypothesis testing.
- Correlation and covariance.

### 4. Optimization (important)

Topics:

- Gradient descent.
- SGD.
- Momentum.
- Adam.
- Learning rate.
- Convex and non-convex optimization.

### 5. Discrete Mathematics (supporting)

Topics:

- Set theory.
- Logic.
- Combinatorics.
- Graph theory.
- Basic combinatorial probability.

**Summary of the mathematics:** if time is limited, focus on:

1. Matrix and vector operations.
2. Derivatives and the chain rule.
3. Probability and distributions.
4. Statistics and hypothesis testing.
5. Gradient descent and optimization.

You do not need to become a pure mathematician. The goal is to be able
to read, understand, and implement mathematical concepts in ML models.

---

## 8. Libraries and Tools to Master

| Library | Purpose |
| --- | --- |
| NumPy | Numerical computation |
| Pandas | Data manipulation |
| Matplotlib | Data visualization |
| Seaborn | Statistical visualization |
| Scikit-learn | Traditional ML |
| PyTorch | Deep Learning |
| TensorFlow/Keras | Deep Learning |
| Hugging Face Transformers | NLP and pretrained models |
| NLTK | NLP preprocessing |
| spaCy | NLP processing |
| XGBoost | Gradient boosting |
| Optuna | Hyperparameter optimization |

For an Applied AI Engineer, prioritise:

- Python.
- NumPy and Pandas.
- Scikit-learn.
- PyTorch.
- Hugging Face.
- Basic model deployment using FastAPI.

---

## 9. Implementation You Must Be Able to Do

Reading theory is not enough. You need to be able to build an
implementation from start to evaluation.

| Skill | Target ability |
| --- | --- |
| Data preprocessing | Cleaning, encoding, scaling |
| EDA | Distribution, correlation, outliers |
| Feature engineering | Creating relevant features |
| Classification | Logistic Regression, Random Forest |
| Regression | Linear Regression, XGBoost |
| Evaluation | Confusion matrix, F1, ROC-AUC |
| Neural network | Building a model with PyTorch |
| Training | Loss, optimizer, backpropagation |
| NLP | Tokenization, embeddings |
| Transformer | Using a pretrained BERT |
| Fine-tuning | Training a pretrained model on a dataset |
| Deployment | Building an inference API |

---

## 10. Mini Projects to Test Your Understanding

The following three projects complement each other, especially for
Applied AI Engineers and fintech use cases.

### Project 1: Credit Risk Prediction

**Focus:** Machine Learning

- Default risk prediction.
- Logistic Regression.
- Random Forest / XGBoost.
- ROC-AUC, Precision, Recall.
- Explainability using SHAP.

### Project 2: Fraud Detection

**Focus:** Machine Learning + Deep Learning

- Detecting fraudulent transactions.
- Handling imbalanced datasets.
- Isolation Forest.
- Neural Network.
- Precision-Recall evaluation.

### Project 3: Financial Sentiment Analysis

**Focus:** NLP + Deep Learning

- Sentiment analysis of financial app reviews.
- Text preprocessing.
- TF-IDF + Logistic Regression.
- Fine-tuning BERT.
- Comparing the performance of the two models.

---

## 11. Cheat Sheet: Formulas to Remember

| Concept | Formula |
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

## 12. Study Checklist

Use this checklist to measure your mastery of the material. Tick an item
when you can explain and implement it, not just after reading it.

### Machine Learning

- [ ] Understand supervised, unsupervised, and reinforcement learning
- [ ] Understand regression and classification
- [ ] Implement Logistic Regression
- [ ] Implement Random Forest and XGBoost
- [ ] Understand overfitting and underfitting
- [ ] Understand the train, validation, test split
- [ ] Master model evaluation

### Deep Learning

- [ ] Understand neural network architecture
- [ ] Understand forward propagation
- [ ] Understand backpropagation
- [ ] Understand activation functions
- [ ] Understand loss functions
- [ ] Understand optimizers
- [ ] Build a neural network yourself

### NLP

- [ ] Understand tokenization and preprocessing
- [ ] Understand Bag of Words and TF-IDF
- [ ] Understand word embeddings
- [ ] Understand RNN, LSTM, and GRU
- [ ] Understand Transformers and attention
- [ ] Understand BERT and GPT
- [ ] Fine-tune a pretrained model

### Frameworks

- [ ] Understand tensors and tensor operations
- [ ] Build a model with PyTorch
- [ ] Write a PyTorch training loop
- [ ] Use Dataset and DataLoader
- [ ] Build a model using Keras
- [ ] Perform model evaluation and inference

### Mathematics

- [ ] Linear algebra and matrix operations
- [ ] Derivatives and partial derivatives
- [ ] Chain rule and gradient
- [ ] Probability and Bayes theorem
- [ ] Statistics and distributions
- [ ] Gradient descent and optimization

---

## 13. Recommended Learning Order

Do not try to learn everything at once. The following order builds
understanding step by step.

| Week | Focus |
| --- | --- |
| 1 | ML fundamentals + Statistics |
| 2 | Linear Algebra + Calculus |
| 3 | Classical ML + Scikit-learn |
| 4 | Deep Learning + Neural Network |
| 5 | PyTorch + Training Loop |
| 6 | NLP fundamentals + Embeddings |
| 7 | Transformer + Hugging Face |
| 8 | End-to-end project + Deployment |

### Principles for an Applied AI Engineer

You should be able to answer three questions:

1. **Why this model?** Why choose this algorithm or architecture?
2. **How does it work?** How does the model learn patterns from data?
3. **How do you evaluate it?** How do you prove the model works well?

You do not have to memorise every formula by heart. However, you must be
able to explain the mathematical intuition, decide when a formula
applies, and implement it in Python.
