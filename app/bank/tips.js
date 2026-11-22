// Short study tips per topic, shown when you tap a pit-wall avatar. Plain strings; keep each under ~140 characters.
;(function (root, tips) {
  if (typeof module === 'object' && module.exports) module.exports = tips
  else root.QuizTips = tips
})(typeof self !== 'undefined' ? self : this, {
  m01: ['Always name the gap: high training score but low validation score means overfitting.', 'Split time-series by date, never randomly, or the future leaks into training.'],
  m02: ['Trace one neuron by hand: z = Wx + b, then the activation. Everything else repeats it.', 'Forward pass, loss, backward pass, optimizer step: say the cycle out loud until it is automatic.'],
  m03: ['Bag of Words ignores order, so "not good" looks like "good". Contextual embeddings fix that.', 'For a Transformer, ask what attention compares: queries against keys, then it mixes the values.'],
  m04: ['Why zero_grad()? PyTorch adds gradients up, so clear them every step.', 'Use model.eval() with torch.no_grad() for validation, and switch back with model.train().'],
  m05: ['Keras fit() hides the loop PyTorch makes you write; know what it does inside.', 'compile() sets optimizer, loss and metrics; fit() trains; evaluate() scores; predict() infers.'],
  m06: ['Fit scalers and encoders on the training set only, then apply them to validation and test.', 'With rare fraud, accuracy lies: read precision, recall and the cost of each error.'],
  x01: ['Matrix shapes: (m x n)(n x p) gives m x p. If the inner sizes differ, you cannot multiply.', 'Cosine similarity is a dot product divided by both lengths, so it ignores magnitude.'],
  x02: ['The chain rule is backpropagation: multiply the local derivatives along the path.', 'The gradient points uphill; gradient descent steps the opposite way.'],
  x03: ['Bayes: a rare event stays rare even after a positive test, because the prior is tiny.', 'Sample variance divides by n-1; population variance divides by n.'],
  x04: ['A learning rate too high diverges, too low crawls. Change it first when loss misbehaves.', 'Momentum and Adam smooth noisy gradients, which helps in narrow valleys.'],
  x05: ['MSE punishes big errors harder than MAE, so outliers dominate it.', 'Cross entropy explodes when the model is confident and wrong.'],
  x06: ['F1 is the harmonic mean, so it punishes a big gap between precision and recall.', 'When a miss is costly, lower the threshold to raise recall and accept lower precision.'],
  x07: ['Order matters for permutations, not for combinations: C(n, k) ignores order.', 'Without replacement, each draw changes the odds of the next.'],
})
