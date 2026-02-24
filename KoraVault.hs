{-# LANGUAGE DataKinds #-}
{-# LANGUAGE NoImplicitPrelude #-}
{-# LANGUAGE TemplateHaskell #-}
{-# LANGUAGE ScopedTypeVariables #-}
{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE TypeApplications #-}

module KoraVault where

import           Plutus.V2.Ledger.Api
import           Plutus.V2.Ledger.Contexts
import           Plutus.V1.Ledger.Value (valueOf, adaSymbol, adaToken)
import           PlutusTx
import           PlutusTx.Prelude hiding (Semigroup(..), unless)

-----------------------------------------------------------------------------------
-- Kora Vault Datum (Matches Off-chain vdSaver, vdTarget, vdLabel)
-----------------------------------------------------------------------------------

data VaultDatum = VaultDatum
    { vdSaver  :: PubKeyHash
    , vdTarget :: Integer
    , vdLabel  :: BuiltinByteString
    }
PlutusTx.unstableMakeIsData ''VaultDatum

-----------------------------------------------------------------------------------
-- Kora Validator Logic
-----------------------------------------------------------------------------------

{-# INLINABLE mkKoraValidator #-}
mkKoraValidator :: VaultDatum -> () -> ScriptContext -> Bool
mkKoraValidator dat _ ctx =
    let
        info = scriptContextTxInfo ctx
        
        -- Helper: Find the ADA value of the UTXO currently being spent
        ownInput = case findOwnInput ctx of
            Nothing -> traceError "input missing"
            Just i  -> i
        
        currentAda = valueOf (txOutValue (txInInfoResolved ownInput)) adaSymbol adaToken
        
        -- Validate conditions
        isOwner    = txSignedBy info (vdSaver dat)
        isReached  = currentAda >= vdTarget dat
    in
        traceIfFalse "Access Denied: Not signed by vault owner" isOwner &&
        traceIfFalse "Vault Locked: Savings target not yet reached" isReached

-----------------------------------------------------------------------------------
-- Compilation Boilerplate
-----------------------------------------------------------------------------------

{-# INLINABLE mkValidatorUntyped #-}
mkValidatorUntyped :: BuiltinData -> BuiltinData -> BuiltinData -> ()
mkValidatorUntyped d r c =
    if mkKoraValidator (unsafeFromBuiltinData d)
                       (unsafeFromBuiltinData r)
                       (unsafeFromBuiltinData c)
    then ()
    else error ()

validator :: Validator
validator = mkValidatorScript $$(PlutusTx.compile [|| mkValidatorUntyped ||])