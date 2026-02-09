# OpenRouter Cost Analysis

## Pricing Reference (as of Feb 2026)
- **Claude Haiku 4.5**: $1.00 per million input tokens, $5.00 per million output tokens
- **Claude Opus 4.5**: $5.00 per million input tokens, $25.00 per million output tokens  
- **Google Gemini 2.0 Flash 001**: ~$0.075 per million input tokens, ~$0.30 per million output tokens (estimated)
- **OpenRouter Platform Fee**: 5.5% markup on top of model pricing

---

## 1. Tag Prediction (`app/api/timer/predict-tags/route.ts`)

### Usage Pattern
- **Frequency**: Called automatically every 15 minutes (4 times/hour, ~96 times/day)
- **Trigger**: Timer triggers 90 seconds before each quarter hour mark

### Models Used

#### A. Overall Story Generation
- **Model**: `anthropic/claude-haiku-4.5`
- **Frequency**: 1 call per prediction cycle
- **Input tokens**: ~2,000-5,000 tokens (keylogs + screenshot summaries)
- **Output tokens**: ~200-300 tokens (max_tokens: 300)
- **Cost per call**: 
  - Input: (3,500 / 1,000,000) × $1.00 = $0.0035
  - Output: (250 / 1,000,000) × $5.00 = $0.00125
  - **Total: ~$0.00475 per call**
- **Daily cost**: 96 calls × $0.00475 = **~$0.46/day**
- **Monthly cost**: **~$13.80/month**

#### B. Individual Tag Predictions (Parallel)
- **Model**: `anthropic/claude-haiku-4.5`
- **Frequency**: N calls per prediction cycle (where N = number of tags with `noAiSuggest: false`)
- **Typical tag count**: Assuming 50-100 tags
- **Input tokens**: ~1,500-3,000 tokens per tag (overall story + tag context + all tags list)
- **Output tokens**: ~300-500 tokens (max_tokens: 500)
- **Cost per call**:
  - Input: (2,250 / 1,000,000) × $1.00 = $0.00225
  - Output: (400 / 1,000,000) × $5.00 = $0.002
  - **Total: ~$0.00425 per tag call**
- **Cost per cycle** (75 tags): 75 × $0.00425 = **~$0.32**
- **Daily cost**: 96 cycles × $0.32 = **~$30.72/day**
- **Monthly cost**: **~$921.60/month** ⚠️ **HIGHEST COST**

#### C. AI Notes Generation
- **Model**: `anthropic/claude-opus-4.5`
- **Frequency**: 1 call per prediction cycle
- **Input tokens**: ~3,000-8,000 tokens (keylogs + screenshot summaries)
- **Output tokens**: ~400-800 tokens (max_tokens: 800)
- **Cost per call**:
  - Input: (5,500 / 1,000,000) × $5.00 = $0.0275
  - Output: (600 / 1,000,000) × $25.00 = $0.015
  - **Total: ~$0.0425 per call**
- **Daily cost**: 96 calls × $0.0425 = **~$4.08/day**
- **Monthly cost**: **~$122.40/month**

### Total Tag Prediction Cost
- **Daily**: $0.46 + $30.72 + $4.08 = **~$35.26/day**
- **Monthly**: **~$1,057.80/month** ⚠️ **VERY HIGH**

---

## 2. Tag Description Generation (`app/api/timer/tags/generateTagDescription.ts`)

### Usage Pattern
- **Frequency**: On-demand, when generating descriptions for tags
- **Typical usage**: One-time setup or occasional updates

### Model Used
- **Model**: `anthropic/claude-opus-4.5`
- **Input tokens**: ~500-2,000 tokens (all tags list + specific tag context)
- **Output tokens**: ~500-1,000 tokens (max_tokens: 1000)
- **Cost per call**:
  - Input: (1,250 / 1,000,000) × $5.00 = $0.00625
  - Output: (750 / 1,000,000) × $25.00 = $0.01875
  - **Total: ~$0.025 per call**
- **Recursive calls**: May trigger additional calls for similar tags (typically 0-3 additional calls)
- **Estimated cost**: 
  - Initial setup (100 tags): 100 × $0.025 = **~$2.50**
  - Updates (occasional): **~$0.50-2.00/month**

---

## 3. Observatory Goals (`app/api/observatory/route.ts`)

### Usage Pattern
- **Frequency**: On-demand via POST request
- **Typical usage**: Daily or weekly updates

### Model Used
- **Model**: `anthropic/claude-opus-4.5`
- **Input tokens**: ~5,000-15,000 tokens (keylogs + screenshots + existing document + subdocuments)
- **Output tokens**: ~2,000-4,000 tokens (max_tokens: 4000)
- **Cost per call**:
  - Input: (10,000 / 1,000,000) × $5.00 = $0.05
  - Output: (3,000 / 1,000,000) × $25.00 = $0.075
  - **Total: ~$0.125 per call**
- **Daily cost** (if called daily): **~$0.125/day**
- **Monthly cost**: **~$3.75/month**

---

## 4. Generic OpenRouter Proxy (`app/api/openrouter/route.ts`)

### Usage Pattern
- **Frequency**: Variable, depends on frontend usage
- **Models**: User-specified via request body

### Cost Estimate
- **Highly variable** - depends on what models/calls are made through this endpoint
- **Typical usage**: Likely minimal, mainly for testing or ad-hoc queries
- **Estimated**: **~$1-10/month** (highly variable)

---

## 5. Extract from Downloads (`tools/extract_from_downloads.py`)

### Usage Pattern
- **Frequency**: On-demand, batch processing of downloaded markdown files
- **Typical usage**: Occasional data extraction tasks

### Model Used
- **Model**: `google/gemini-2.0-flash-001` (default, can be overridden)
- **Input tokens**: ~5,000-15,000 tokens per file (prompt + markdown content)
- **Output tokens**: ~500-2,000 tokens (JSON extraction results)
- **Cost per call** (Gemini pricing estimated):
  - Input: (10,000 / 1,000,000) × $0.075 = $0.00075
  - Output: (1,250 / 1,000,000) × $0.30 = $0.000375
  - **Total: ~$0.001125 per file**
- **Batch processing** (100 files): 100 × $0.001125 = **~$0.11**
- **Estimated monthly**: **~$0.50-5.00/month** (depends on usage)

---

## 6. Figure Extraction (`tools/figure-extraction/extract_and_convert_figures.py`)

### Usage Pattern
- **Frequency**: On-demand, processing images/figures
- **Typical usage**: Occasional document processing

### Models Used
- **Model**: `anthropic/claude-opus-4` (older version)
- **Input tokens**: Variable (image + text context)
- **Cost**: Similar to Opus 4.5 pricing
- **Estimated monthly**: **~$1-10/month** (depends on usage)

---

## 7. Convert Figures to Tables (`tools/figure-extraction/convert_figures_to_tables.py`)

### Usage Pattern
- **Frequency**: On-demand, converting figures/images to tables
- **Typical usage**: Occasional document processing

### Models Used
- **Opus**: `anthropic/claude-opus-4.5` (for complex conversions)
- **Haiku**: `anthropic/claude-haiku-4.5` (for simpler tasks)
- **Cost per conversion**:
  - Opus: ~$0.05-0.15 per image (depending on complexity)
  - Haiku: ~$0.01-0.03 per image
- **Estimated monthly**: **~$2-20/month** (depends on usage)

---

## Summary: Total Estimated Monthly Costs

| Component | Monthly Cost | Notes |
|-----------|--------------|-------|
| **Tag Prediction** | **~$1,057.80** | ⚠️ **HIGHEST** - Runs every 15 minutes |
| Tag Description Generation | ~$0.50-2.00 | On-demand, occasional |
| Observatory Goals | ~$3.75 | Daily updates |
| Generic Proxy | ~$1-10 | Variable usage |
| Extract from Downloads | ~$0.50-5.00 | Occasional batch jobs |
| Figure Extraction | ~$1-10 | Occasional processing |
| Convert Figures to Tables | ~$2-20 | Occasional processing |
| **TOTAL** | **~$1,066-1,124/month** | **Primary cost is tag prediction** |

---

## Cost Optimization Recommendations

### High Impact
1. **Reduce Tag Prediction Frequency**
   - Currently runs every 15 minutes (96 times/day)
   - Consider: Run every 30 minutes (48 times/day) → **~50% cost reduction**
   - Or: Only run during active hours (e.g., 8am-10pm) → **~40% cost reduction**

2. **Optimize Tag Prediction Parallel Calls**
   - Currently: 1 call per tag (could be 50-100+ tags)
   - Consider: Batch multiple tags in single call
   - Or: Only predict high-priority tags, defer others
   - Potential savings: **~$400-600/month**

3. **Use Cheaper Model for Tag Predictions**
   - Switch from Haiku to Gemini Flash for tag predictions
   - Cost reduction: ~75% cheaper
   - Potential savings: **~$700/month**

### Medium Impact
4. **Cache Overall Story**
   - Overall story might not change much between 15-min intervals
   - Cache for 30-60 minutes
   - Potential savings: **~$13/month**

5. **Use Haiku for AI Notes Instead of Opus**
   - Switch AI notes from Opus to Haiku
   - Potential savings: **~$100/month**

### Low Impact
6. **Optimize Observatory Goals Frequency**
   - Run weekly instead of daily
   - Potential savings: **~$2.50/month**

---

## Notes
- All costs include OpenRouter's 5.5% platform fee
- Token estimates are approximate and may vary based on actual content
- Tag prediction is by far the largest cost driver
- Costs scale linearly with number of tags and prediction frequency
