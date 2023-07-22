/**
 * 迈道e家签到
 */
let {config} = require('../config.js')(runtime, global)
let singletonRequire = require('../lib/SingletonRequirer.js')(runtime, this)
let FloatyInstance = singletonRequire('FloatyUtil')
let widgetUtils = singletonRequire('WidgetUtils')
let automator = singletonRequire('Automator')
let _logUtils = singletonRequire('LogUtils')
let commonFunctions = singletonRequire('CommonFunction')
let localOcrUtil = require('../lib/LocalOcrUtil.js')

let BaseSignRunner = require('./BaseSignRunner.js')

function SignRunner() {
    // ['sign_btn', 'mine_btn', 'mine_checked_btn', 'signed_icon'])
    //'1.wechat_icon', '2.sign_btn', '3.work_space',
    //         '4.sign_banner'
    //'wechat_icon_1','sign_btn_2','work_space_3','sign_banner_4',

    let wechatIcon_1 = config.wechat_sign_config.wechat_icon_1
    // let signBtn_2 = config.wechat_sign_config.sign_btn_2
    let workSpace_3 = config.wechat_sign_config.work_space_3
    // let signBanner_4 = config.wechat_sign_config.sign_banner_4
    // let sign_banner_4_2 = config.wechat_sign_config.sign_banner_4_2
    // let sign_btn_back_5 = config.wechat_sign_config.sign_btn_back_5

    let signButtonBase64 = "iVBORw0KGgoAAAANSUhEUgAAAJEAAABMCAYAAABteFXSAAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAB40SURBVHic1V17cFXV1f+dc+/Ng0ACCYEQIBDCIxFIEBWIhCAMFWSkqRbboVCBGXXEsXRsa9E/bDtYH+2gWIXSdlraqKWVqShQGF4S3lhMGQoM0IDyDo9AApIHuY9zvj/yre06++597rlJSOxvJpN7z9mPtddee732PucaTU1NNgDYtg2CYRiwbRu2bYvPpmnCNE3Ytg3LskQ5L6C2qTy1bZomfD4fLMsSZfx+v+iD9+fz+WCaJiKRCCKRiJZWwzBEm6FQCIZhwDRNUTYhIQGhUAi2bSMQCIh7AESfnO5wOCzaiEQigh6/3y/6JprD4bD4TvfC4TBM04RhGLAsS/yn/mQ+cl7RH+ePzEuil/PP7/d7mpf2gp8znwghhhFxRDANhl+TBYnuy/e4APHPXCAIlmUJ5tu2jYSEBDFRNJEqAabyJCxUxufzCbpIAGhi+eKhcsFgEJFIRAgD5wcXmMTERBiGgVAohFAoBNM0EQgEhHD4fD4kJCQ4xk+CxvnC+UvXVHxW8Z0EszPhEFlZU3BwYvnKlhlC9eV7dJ3fV4GYTBMQDoeF4JAQySuXyvt8PoRCIaE9SCsR/ZZlifqkBek+0RaJRIQA0/dgMOjQcKZpOoTJsiwEAgFxn2s00iT8j2sj3ULjvOJtqTSvzN+OhtHU1GTHmnRRWCJatWLcBuLGALlfmmjObF5fRRu/xhkPwGHaaCITExMBtAhuOBwW5o0LAjcn9N/v9wuNQwJM/VNd0mr0ncbFxwZACDUJIGk8nbni7fCxEwKBQMebMzIBnEAAjgkEnJPI4aZK5fIq38jtOzd1NGF8AuR2eb80LtJich1idHNzsxhnOBxGQkKC0E7cH+IajQuoPMn0nfwuzjvZz6ExkbCSEIfDYQf/OO/5nFB/st/U0fATsQROOBcwL2pTtzp0UJk1nXoH4HBY6Y874jLkMQBwaIVgMOjQOGS6aAFxk8Ink2sP2QfkJpcLGC/PzTPdD4fD4r4KKtdBt/g6Gn5Z2wBQrnR5wt0IV2kglSZTmUC3frgJIHCh4FA57HKQwAUIgDBL3GwR5BUv+zqkqUiAeF3uT5L5AyD8PR6tcW2lM2FfJwECJMeaEyoLEt1384t00A1Q50epmAUgyl/gq57oILp1UYtsFrjZo4mndAa1I/s9dI+bO+pP1j7yOHikx/0mLqQqnnDh7exoTEaUB8aZrIrCZL9EVuVu8KqqVXVUZo4EgCadGEzRFTcfOmGXw2ryTchsAXBoGaqjcvApdSBrOa61qD7XiH6/Hz6fT/hC8pjl4EIei4o3HQkhRKpJlAVHFYXF8pncfCmVT0R13LQbr+fz+RwahCaPR1SqvnXMJgGitnk+iQuBrBl0mof65sLs9/uFKeP3VfxQ+UGxeNPR8OuYywfFk3gEr8TKzJXrugkv1VGtOvpOYTFpHXJgKWHJ6/A2uRBQOyRAlKviJo3+c16QhvL7/VE+mLzIqBynh+eMZPOr8ym5yeO86VSfSF5FhFiRk06dqqDTVrp6bhpKdZ+cU9mscUdZplt2TqlcOBxGKBQS5alNrtnkbRjZCad2uWBFIhHRFgk9zw25mXQ331Fe6J0BEeJ7MWeAewThBbGccKJHpsFNqKgcj3S4JlH1xxlPdfi+HBdGTrPKpPE8EpUNhUKOUJ876zL93HwSHVzIVULJx8TH2SnmjBOki4oI8t6ZKtSUoRK0WMKnuq8ypyo1z4WcBERlHlV5JQ4uGHwrhrfB/7jw0lYITx9QHb5tI299EJ3ylonsi8rBDO+7o7PVgOQTycIjR2UAtGozljbj5fg9lbC6RSf8v8ohVZkpuT85alP1y/fITNNEMBhsYRhLbnKBJbPEN1+Jdk6jylfi/cuJTn5Pp5W9uhV3Cn63jvmAuXkA9BlUlUpt7eDk6EcGTR6FyLTVwIVOPoahmgwuCNxsUVvcWSc+cBOiSmySr8R5RfTIESQfIz+lIGsot8itMxGl+9wcT/k6v9aaAXkRLjlK0dXl5knefOX3+G6/vOsu7/g3NzeL0wT8Pi9DdKkE3m3SVUlRt/KxtE0st+JOIipPJBMhp+x1psJNW9AKjBWF8Dpy324qXNYEvD/+XY7edFsOcsQTCoUcCUgyXVw7y5pYZUY5zXSqwG3y+TUu4PIiVvGuI6HNE7k5xPLAdWaHvnM/Suckyv3rVqFqpcttqgIAus43P2UzxduhEJ63ySeIckPy+OizrHXk8bjxQB6vzA+5XGfDLwuNF8mONSBdtKESQFUdeSXLQqjr37a/2uOSs8E6GknjANHbEXJ+ST7tadtfHbHl2opno0kYKWKLxTfdwpXHoQoIVHztCAhzpgs3CTLhchnVpPNNSc5EuR0355m3KUctOq2oa4fK6gIEooOcbN4vtc3PZXMTSNe5KVQ57DLvYmll+Xpn+j46mDxpRojl0FmWhbq6Opw9exY3btyIqsNh23ZMAQJaopmLFy/iwoULaGpqitIeqnyPri0VzVxAqAwfu0r7UTnDMHDo0CFcvnzZIRxysMEz55QaiEQi2LVrFy5fvhxFq5v/ohIWeTxfFxiNjY2uIi1HZrZt49SpU9i3bx9u376NtLQ03HvvvRg0aJAjuaZSv7qBW5aFbdu24ezZs7BtGwMGDMB9992HHj16OPwWVQSmW6n8O0VkdH5apVWprOzbWJaFxsZGlJWVobm5Gffffz/eeustAO5HW4muI0eO4OmnnwYAzJ49W3zmgi7zWKaFz4U8RrlMIBBAIBBQ8rm1uHTpElatWgUAuO+++1BaWuq471dJPEFFbDgcxs6dO3Hx4kXYto2rV68iKSkJGRkZ6NGjh1JNu7VvGAa++OIL/Pvf/0ZzczMA4ObNm+jWrRtKSkqEj8PzQPFGJLJTLTvkstkgE0Rmae/evYK2iRMnRmlq1dEQanvNmjWi7NSpU5W0EVQb3bEQyw1oD9y6dQt/+9vfAADdunVTC5FuCyAUCqG6uho3btwQIWkwGBQCBLSsxvPnz+PgwYPo0aNHq4isqqoSkwQAjY2NqKqqQmJiohCi5ORkZGdnIyUlBYC7T8AngicN5QnSTYDsy3z00UcAgOTkZEycONGRSKT+uEmkiO3YsWPYsmULAGDSpEkYNGhQVN9uAYbq+saNG7Fr1y7t2Hmg4AUvv/yy4GlrEXWykQi5fv06qqurxYrkxxhUalZOxsUDWYiJudw83r59GydPnkTXrl0xePBgB70q6CJBlemzLEs8H8Z38G3bxoEDB3D06FEALYf6H3vssaj6Ml544QVMmDAB77zzjri2b98+TJ8+XUmnDqtXr0ZKSopjHJcvX8bevXu1deIFmeCVK1fi/fffBwB8+OGHcSkEvyoyunXrFmpqaqJsNP+vQns6e6r+fD4fmpqacPbsWQwYMMBRnujnh+e5ZnDTOOQQUzku1O+++674bFkWbt26FZP2cDiM8vJyHD58WFxrbm52aFuv4IIOAL1798bYsWOjyp0/fx7V1dUAgKysLIfWcwPfZP7yyy8BxB/5RSUbiVFNTU1KzULbALQhCbT9WacuXbo4vpumGfWIM8f169fRt29f8fQHmR465cjzNIB7ZpcETT6/bRgGdu/eLQRh0qRJGD9+PA4fPox169YBAGbMmIGioiJHWG9ZFi5cuIA//vGPAIA+ffpg/vz5gpfXrl3DihUrAADZ2dmYP3++NnVCz8Vx2qdPnx6l0SzLwoIFC4QQvfrqqygsLFTy7k5AHAUhJjQ2NqK+vl5rmnw+H3JycnD+/HnxnFbPnj3bZFezsrKQlpaGhoYGAEBqaioyMzO1mi0hIQHV1dXo37+/EF6+JyYnCd00pE64bt68iTfffBMAkJKSgueeew4ZGRkoKSnBjh078OWXX+Ls2bNYtGiRI6I7ePAgXn31VfH9pZdewsiRIxEIBGDbLQnLq1ev4sMPP0R1dTXS0tJw//33O+iRHX43GIaByspKHD9+HAAwbdo0hwCFw2GsXbsWV65cwTPPPOPaVmthcoINoyXbSpOprGCaGDZsGIYNG4aBAweioKAAAwcObLMmuueeezBo0CDk5uaioKAAvXr10pbnZoWeXrUsC8FgUPmsuy40Vp14pL/f//73uHbtGgDgqaeeQkZGBgCga9eumD17NgDg8OHDOHDggOjDsiwUFBRg7ty5AIB58+ahsLAw6kjtU089hd69ewMAXn/9dZFrU+XrYqUvwuEwfve73wFo2Yp58sknHWX+8Y9/4LXXXsPKlSuxdetWLU/bApN78/Lhdh0SExMxePBgFBUVYeDAgULttgXdu3fHiBEjMHLkSPTu3ds1wiBmJiUlCeElv8YtIcfDb9UEUfn169cLkzVkyBDMmDHDkSKYPn26oG/dunVCi9t2y7YLCd/777+PXbt2iWO3VL9r16549tlnAQC1tbX44IMPlBpHJUD8v2EY2Lx5M06dOgUA+P73v4/s7GxHG9/+9rdx9913AwAWL16M06dPa/naWpiy2vw6ZUJjQQ7dVUIjmzOd4NDnmpoaLF++HEDLYvnZz34mIjdC9+7dMWXKFADAoUOHUF9fD9tueaJ2yZIlWL9+PYAWLUkBAPltJEgTJkwQUebf//531NTUOOhw00CE69evC1rz8vIwa9asqDKBQACLFy9Gamoqmpqa8OKLL7pamtbA5JqnIxJX7YVIJILbt2+LA/B8EbgtCm66eeRGf5mZmXjvvfcwbtw4/PjHP8aAAQMc/KH25syZgxUrVuCjjz5CSkoK6urq8Pzzz2PDhg2iL8uysHDhQhw5cgRAdGLxpz/9KZYsWYI1a9agZ8+eDoHm2ysyKBB46623cOvWLZimiUWLFiEpKUnJqz59+mDx4sUAgFOnTuGNN96In+Eu8FM+hq/q/wUYhiGiwkgkIvI7PNlHkDWSm6CZpolevXrhV7/6VZQG43Vyc3NFO7t378aSJUuEGZs5cybKysrwyiuv4MSJE3jmmWcwd+5czJkzB8nJyUJICgoKHE65WzqCw7ZtrFq1ChUVFaK/tLQ0nDhxAg0NDaivr8eNGzdQV1eH2tpa1NbW4tq1ayJ6XLduHSZOnIiJEye2aQ4IImPNn4Gqr69HY2Nju3RwJ2AYhvCb5PBcZ9Lka7wt/lkWLDfzfvXqVSxfvhyffPIJgBbH9ic/+QkefvhhAMDbb7+N3/zmN9iwYQPKy8uxdetWLFiwAJMmTYpKMch0qUD3V69ejT/84Q/i+urVq7F69WrXujJeeeUVFBUVoXv37nHVU8HPVTURevnyZXzxxRdtbvxOwTRNPPDAA0KIeDpCNRHy2zt0cDvvw4UpHA5jy5YteOedd1BfXw+gJQn48ssvIz8/XwhGcnIyFi1ahIKCArz99tuorq7GSy+9hBEjRuDpp5/GqFGjPAmQHPLHygGZponMzEz06dMHvXr1QmZmJnr27ImMjAzU1dVh6dKlqK2txZ///Gc899xzrm15gfLVMpFIpFXZ1Y4CP3XIs80cuky7Km8kT6ROO4VCIVRUVKC8vBznzp0D0DJhs2bNwuOPP46UlJQoOkzTRFlZGcaMGYPf/va32LFjB44ePYpnn30W48aNw6OPPoqxY8dGnQt3CwqGDRuGIUOGICcnBzk5OejduzcyMzORkZGBjIwMZGZmalMutm3jX//6F/bt24fGxkZxdKUtED39LznVwFeHxfjOvJxjUa1ynZnizraM5uZmbNu2DeXl5bh06ZK4ftddd+FHP/oR8vPzHf3I0aJhGOjTpw9++ctfYv/+/Vi6dCmqq6vx6aef4tNPP0V2dja++93v4sEHH0S3bt2UC0J2yv/0pz9FjYn63rx5MwCgb9++GDVqVFRbP/zhDzFr1iwUFxermRsnRMY6Vmb36wb5vLQbuMOqO9Uoj9+yLFRVVaGiogIbN25EXV2duNenTx+MHj0aQ4cORVVVFU6ePCna8IKZM2ciMTER5eXluHr1Kqqrq7F06VIsW7YMJSUlKC0txejRo5Genu6glfpwy2gHg0H8/Oc/BwB85zvfiRIioCUdkJeX54lWL/DLxHUGkpOTkZqaisbGRk8bnMBXjzzHMk30WdY0qoQj0LL5vHHjRmzYsCEqMZednY158+ZhypQp+Pjjj7F06dK4xwq05G4qKirw0EMPYdu2bXjvvfdw/vx5YS4p6nrsscewcOHCqPTF1w2Ox6g7A8nJySguLkZRURFOnjyJTZs2ibd5eIX8hIXO//EyzqSkJHz22WcOARo1ahTKysowceJEJCQkwLZbHldOTU1tFe/IXwkEAnjooYcwZcoUfPbZZ9iyZQsqKipgWRZ69eqFOXPmOOrFGk9nKQK/Tp13BBITEzFmzBhMnjxZvML3k08+iVuIdCG8rHkIKu1L1wKBAF544QUsXLgQkydPxje+8Q0MHDgwKofzyCOP4JFHHlGalFj+pXw/EAiguLgYxcXFWLhwIfbu3Yt+/fqJMz2y2b18+TKuX7+uFCoeENXU1DiOo8gYOHAgUlNTtfe9wi8zsaMQCAQwevRoTJgwQbzOVz7hGAuqqEolQKqMvG7VGoaBnj17YtWqVSJvJtdRmVAqU11djaNHj2Lq1KnKPrjWNAwD//nPfzBkyBCRhMzIyMCMGTOiBJz3uWnTJqxcuTImf7hpVGH58uXKs0nxwvHcWUfB5/OhsLAQJSUl6Nq1KwDg6NGj2LNnT8zNXxk6BxOIrX34PR7hqaK9UCiE/fv3ixMHvH1qe8+ePXjxxRcBADk5OSJqk2kgUKifkJCABQsWOE5N8rF93eFwrDuCYMMwUFBQgJKSEqSnp8MwDFRVVWHz5s2ora2Nuz3Vlga/p+rfzfypwnTDMPD888+jsrIS6enpePfdd5GamhrFr3vvvReZmZmoqanBX/7yF7z22mtRQs77ouOowWBQ7LRzh181H7ZtY9q0aRgzZoy4xp98CQaD+MEPfgAAmDx5Mh5//HEt73JycrT34oFfVpnxOGapqakYPnw4gsGg2LeJhby8PEyYMAFZWVkwTRPnzp3DP//5T7HvFA9kcyVf54iVEVYl3LggzZs3D5WVlaitrcWKFSvEYTSuxZKTkzF//nz8+te/xt69e3HkyBGRXZZN7YkTJ8RZ6alTpyIvL08ZMaryXVlZWcjKylKOlbsDPXv2xIgRI7Tjbi8Iztl27HNEHD6fD7m5uZg6dSqmT5+OcePGRR1zldGvXz+UlpYiJycHpmniypUrWLt2La5evdr6EUD/3m3Am5nmr59RvekD+CpCA4ANGzaIw2iyyXnwwQeRmZkJACgvL9dGjaSFAOB73/ueQ5PKbbqNR/bXOiM6M3nn8RBAZRMSEtC1a1c88MADGD16tPaAWkZGBkpLSzF06FCYpom6ujqsXbsW1dXVbR64nB2WozJ5G4P/V7UjmzJaYE8++aSImN544w3cvn07yoFPTEwUofmBAwfw+eefR/H35MmT2LFjB4AWoeOJP8NQv55PNofywuFPxnQ0TKB1DpxlWTh79iwOHjwoHrmZNm0aioqKop7ApAcRCwsLYRiGSOidOXMmbkeaQ+U/6ARSJUhyW3RPFgyisXv37uKc8qVLl/Dxxx9Hhf62bYuUBdDynJhMV3l5ufg8e/ZspQkjWuRX18hlZD54RSgUcvigM2fOxJo1a7BmzRqkpaV5bgf4/5ONMlFecePGDezcuRNHjhwRv9Lz8MMPY8SIESKh1qVLF4wdOxbjxo2DYRior6/H9u3bceLECeUbxtoLXJvIk6yaNNlk0Hf55OSUKVOQm5sLoEUYKMPOJzwtLU2cfNy0aZPwU2y75Tm2nTt3AgAeffRR0RaHrAH5NXm+vAhQQ0MDjh07hvXr1+PNN9/EE088gdLSUixZskSUSU9PFxu68T4/qPy9s3hQU1ODiooK+Hw+5OfnIzExEWVlZYhEIjh16hTuvvtuTJo0CaZpoqGhAfv378ehQ4ccjxy1FarJV2keLwtFFenxCfP7/Zg7dy5+8YtfIBQK4fjx4xg9erQoT3VKS0vR1NSEsrIyoZWCwSCWLVsGoOUJkrlz5wrh8+LHueW2gJatIP7iiD179qCyslJ7rIceEGgrlG+PjReXLl3Czp074fP5ROLsW9/6Fvbv34+SkhL4/X40NTXh4MGDOHDgwB0/8KZS+6ro0y0alaMpLpwTJkzAggULMG3aNMeTorz8+PHjMX78eEd7H3zwgdhOeeKJJ5Cenu440Uht6JKMfGy1tbW4cOECzpw5g9OnT+PkyZM4fvy4Y3HSc2gc6enpKCoqQn5+PkaOHOnKR69wfaFDPDh37hx27NgBn8+HvLw8pKSkCJXe3NyMo0ePYv/+/eIpy/aGPOE6x5nKxtJUcvjOJzchIcFxKF4XMfH7//3vf8Xxjf79++Ob3/ymKKviveq6YRhYtmwZtm7d6imn1rdvXxQVFWHYsGEYPHgwcnNzXR/F0oGnDVSpkHbd9jhz5gy2b98Ov98vziCHw2FUVVVh9+7duH79epv78ApdQhGIdrJlwfv888+VL01QTaoXGkzTxPbt2x2PQv/1r3/VtmPbNhITE6Oe3rDtlpdsqQQoLy8Pw4cPR35+PoYOHYrc3Ny4HWSg5Tm1Y8eOib3McDgs3kUAQNmm41Bae+D06dPYsmULpk6digEDBuDUqVPYvn07rly50i7tE+SwXuUY66Iwlbnj1y9duuRpb6q1qKysRGVlpWuZXr16KR8Buuuuu5Cfn4/hw4cLYRkwYAC6dOkihKwt7yfKzc3F66+/rryXmpqq3Gvz61R7W3DmzBmsX78ePXr0wLVr16LeEnYnoPMdVJo2loCZpolu3brdQWqdUNGiS9yWlJSgpKQkyp9rryRjYWEhUlNThdthmib69euHwsJCzJ07V7lV4vpTVa2Fbdu4ePFiuyQSvfQFRJulWJEMD9v5dQAoLi7Ghg0blL6SbpG59RkL3LmWQ3tVHzJN7YlAIIB169YJrUbv8HaD8mXo7YWOSMG7aRweOqsSkvI1nYMcj1mUafOaVrBtO+qYiNy2W1tumfh4QScrvCJKxHw+H5KTk9tMyJ2EYRhR5sbN6XVjrJyIjKeu3LdKY8lJQi806IRFR19nbXcQHK+WAVpsMb1wsyM0SWvg8/mQlZXlUP9A9KYpj47cEnjyd7dtEVVZFa/kCY/Fy1hpArfy7RlhtwYml2TDMJCYmIj+/fu7vh+oM2EYBoYNG+Z4EoI/h6YL3wlewnTZX4o1oW73dfkeWYPYtq18F6SqHm9Xfj1OZ8BhzoiI/v3745577kH37t3b/GBbe4IEnL+FlTPTML76tUUZbm941QleLEdZpQVjRUyqtnV96MyWm6PfGYJkNDQ02CpimpubUVVVhRMnTuDmzZtobm5uNwJ1qljXPvlp2dnZKC4uFofLY50AiGXCYvkpujZ1EaCX9twCAV5WlQSN1RZwZ95jHQuuL0O3bRtNTU24efMmGhoalL/mQ+W8Cphuu8HNdCQlJSEtLQ2pqalRz92rohmvzrBXc8Xb9VrPTUN4FTx+X2eGZYHy+/0dLkTKEJ8PLDk5GUlJSdpkHtWJdyLosxuzvTq4qjZ0yUUvpsMtfG+tSWmNf+nVhHW276p0eNqi7t0gh73UjiqyUals3eTEQ6dOOOLRDioNqNOK/LrXKErmT6zEI++nMwQq6mSjYRiOpwfoGsHLStZBFya7lddpLVV/Ou3odeWqJkXlsxGP6Jru5WDxjldFo04LqhZAp4X4MhFebTSvp2pD15Y8YDdhiDUJcjldpKTSBry9WJpRR4usWb1q2FhRmRutMt2qeh0NYc7kN8rrVL1XpvPVGo/6dhMujlj9yu3yNuNhNC+r+m17Vds60+IlMlP125YyHQFlnshtcCpbzO/xMvxH5WS4rTK5Hbn/WJAFXe7DrW8ZOhPp5sfFolOmrbM0SHvBr2KKKvSW7+m+c8j1Y0ViOoGJ5TDqtIBKmGzbjvL5VJ91WsNLhtiNXi+a+X8NUXtnKug0ideJ5SaGrqnaU/Wl0xo0GbLpkOu7aUM3DemmAXm/bm2poHIDVAtIpsdNO1O5zhLOqHc2EnSTpPou1+PX3SZP51fJjPLSt5uzqvNRVP3p6JX7isUDuT+3xaDrV3Vd129nareoQ2lefABZtbsNTMf81jq8KvMkC4FOAOU6Mk26PgDnz3nGGgPnmddAwW28sfjS2eZR+ZIr3arljHP7OQS6ZlkW/H4/EhISYFlW1GPHvDz1qxJCXRSmY65Kg1L7vD8O+XdBeB2ZL7GEntMWy2n36neqaHfjT0fC8X4iL2pfdlj54OTMKj2CzFMG5B/xwct7crJ2UUGlPdwY6ubgq66pNCjvx60sb0+lAVVaz03AVehsweH4P+HsX8pUyfu7AAAAAElFTkSuQmCC";

    this.restartLimit = 3

    BaseSignRunner.call(this)
    let _package_name = 'com.vmos.pro'

    this.exec = function () {
        // FloatyInstance.setFloatyText('准备查找 签到按钮')
        // // automator.randomScrollDown(2000,1800,config.device_height / 5,config.device_height / 4);
        // // randomScrollDown: function (minStart, maxStart, minEnd, maxEnd)
        // automator.randomScrollDown(2000,1800,config.device_height / 5,config.device_height / 4);
        // FloatyInstance.setFloatyText('准备查找 签到按钮' )
        // return;


        _logUtils.debugForDev(['开始企业微信-迈道E家签到'], true, false)

        launch(_package_name)
        sleep(1000)
        FloatyInstance.setFloatyText('准备查找 企业微信图标')
        _logUtils.debugForDev(['准备查找 企业微信图标'], true, false)
        let clickWechatIcon = null



        //查找虚拟机页面，确定出现之后，点击屏幕中心，然后点击进入按钮
        //如果没找到虚拟机，查找微信图标
        FloatyInstance.setFloatyText('准备用OCR方式查找,等待10秒')
        _logUtils.debugForDev(['准备用OCR方式查找,等待10秒'], true, false)
        sleep(10000)

        clickWechatIcon = this.captureAndCheckByImg(wechatIcon_1, '企业微信图标', null, true, null)
        if (clickWechatIcon) {
            FloatyInstance.setFloatyText('等待打开企业微信');
            sleep(40000)
        }
        if (!clickWechatIcon) {
            FloatyInstance.setFloatyText('查找虚拟机图标');
            //查找虚拟机页面，确定出现之后，点击屏幕中心，然后点击进入按钮
            //如果没找到虚拟机，查找微信图标

            let 虚拟机 = this.captureAndCheckByOcr('^虚拟机$', '虚拟机$');
            if (虚拟机) {
                //点击屏幕正中心
                FloatyInstance.setFloatyText('点击屏幕正中心');
                automator.click(config.device_width / 2, config.device_height / 2);
                sleep(1000)
                FloatyInstance.setFloatyText('识别进入按钮');
                let clickEntityButton = this.captureAndCheckByOcr('^进入$', '进入按钮', null, 800, true, 2);
                clickWechatIcon = true;
                sleep(1000)
                this.captureAndCheckByOcr('^企业微信$', '企业微信', null, 800, true, 4);
            }
        }

        if (!clickWechatIcon) {
            if (this.restartLimit-- >= 0) {
                FloatyInstance.setFloatyText('未找到 企业微信图标，，并且重启次数大于1，重新开启应用')
                _logUtils.debugForDev(['未找到 企业微信图标，，并且重启次数大于1，重新开启应用'], true, false)

                commonFunctions.killCurrentApp()
                sleep(2000)
                this.exec()
            }
        }

        //点击之后有可能出现pro会员提示，需要处理
        _logUtils.debugForDev(['自动打卡对话框'], true, false)

        //点击消息tab页的迈道E家图标
        let clickMaiDaoEhome = null;
        for (let i = 0; i < 3; i++) {
            FloatyInstance.setFloatyText('开始找迈道E家对话框，第' + i + '次');
            sleep(1000)

            clickMaiDaoEhome = this.captureAndCheckByOcr('.*迈道E家.*', '迈道E家', null, 800, true, 2)
            if (!clickMaiDaoEhome) {
                FloatyInstance.setFloatyText('开始找迈道E家对话框，第' + i + '次，没找到下滑再找');
                automator.randomScrollDown(2000,1800,config.device_height / 5,config.device_height / 4);
            } else {
                FloatyInstance.setFloatyText('开始找迈道E家对话框，第' + i + '次找到了');
                break;
            }
        }
        sleep(2000)

        //如果消息tab页的迈道E家图标找不到，就去工作台找
        if (!clickMaiDaoEhome) {
            //点击工作台按钮
            if (this.captureAndCheckByImg(workSpace_3, '点击工作台', null, true)) {
                //下滑至最底部
                // for (let i = 0; i < 3; i++) {
                //     automator.randomScrollDown(2000,1800,config.device_height / 5,config.device_height / 4);
                //     sleep(500)
                // }

                for (let i = 0; i < 3; i++) {
                    FloatyInstance.setFloatyText('开始找迈道E家【工作台】对话框，第' + i + '次');
                    sleep(1000)
                    clickMaiDaoEhome = this.captureAndCheckByOcr('.*迈道E家.*', '迈道E家【工作台】', [0,0], 800, true, 2)
                    if (!clickMaiDaoEhome) {
                        FloatyInstance.setFloatyText('开始找迈道E家【工作台】对话框，第' + i + '次，没找到下滑再找');
                        automator.randomScrollDown(2000,1800,config.device_height / 5,config.device_height / 4);
                    } else {
                        FloatyInstance.setFloatyText('开始找迈道E家【工作台】对话框，第' + i + '次找到了');
                        break;
                    }
                }
            }
        }


        let clickEntityhome = this.captureAndCheckByOcr('^进入主页$', '进入主页', [0, config.device_height * 0.7], 800, true, 2);

        sleep(4000)

        let clickSign = this.captureAndCheckByOcr('.*签到.*', '签到按钮', [config.device_width * 0.5, 0], 800, true, 2);

        // let clickSign = this.captureAndCheckByOcr('.*签到.*', '签到按钮', [config.device_width*0.5, 0,config.device_width*0.5,config.device_height *0.5], 800, false, 2);
        //如果找到了签到按钮，设置任务为完成，没找到，有可能失败，也可能已经完成
        if (clickSign) {
            FloatyInstance.setFloatyText('本次找到了签到按钮')
        } else {
            FloatyInstance.setFloatyText('未找到签到按钮，用图片识别再找一次')
            if (!this.checkForTargetImg(signButtonBase64, '图片识别签到按钮')) {

                FloatyInstance.setFloatyText('图片识别签到按钮 也找不到。重开应用再找一次')
                commonFunctions.killCurrentApp()
                sleep(2000)
                return this.exec()
            }
        }

        sleep(3000)
        !config._debugging && commonFunctions.minimize(_package_name)
    }


}

SignRunner.prototype = Object.create(BaseSignRunner.prototype)
SignRunner.prototype.constructor = SignRunner
module.exports = new SignRunner()
