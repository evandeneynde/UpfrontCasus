<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Production\BatchController;
use App\Http\Controllers\TrainingController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    // Training: all workers must complete before starting batches.
    Route::get('training', [TrainingController::class, 'index'])->name('training.index');
    Route::post('training', [TrainingController::class, 'submit'])->name('training.submit');

    // Admin: manage training content.
    Route::middleware('can:admin')->group(function () {
        Route::get('admin/training', [Admin\TrainingStepController::class, 'index'])->name('admin.training.index');
        Route::get('admin/training/{step}/edit', [Admin\TrainingStepController::class, 'edit'])->name('admin.training.edit');
        Route::put('admin/training/{step}', [Admin\TrainingStepController::class, 'update'])->name('admin.training.update');
    });

    // Admin: manage products (recipes).
    Route::middleware('can:admin')->group(function () {
        Route::get('admin/products', [ProductController::class, 'index'])->name('admin.products.index');
        Route::get('admin/products/create', [ProductController::class, 'create'])->name('admin.products.create');
        Route::post('admin/products', [ProductController::class, 'store'])->name('admin.products.store');
        Route::get('admin/products/{product}/edit', [ProductController::class, 'edit'])->name('admin.products.edit');
        Route::put('admin/products/{product}', [ProductController::class, 'update'])->name('admin.products.update');
        Route::delete('admin/products/{product}', [ProductController::class, 'destroy'])->name('admin.products.destroy');
    });

    // Worker: run production batches.
    Route::get('production', [BatchController::class, 'index'])->name('production.index');
    Route::get('production/create', [BatchController::class, 'create'])->name('production.create');
    Route::post('production', [BatchController::class, 'store'])->name('production.store');
    Route::get('production/{batch}', [BatchController::class, 'run'])->name('production.run');
    Route::delete('production/{batch}', [BatchController::class, 'destroy'])->name('production.destroy');

    Route::patch('production/{batch}/weighing', [BatchController::class, 'storeWeighing'])->name('production.weighing');
    Route::patch('production/{batch}/sifting', [BatchController::class, 'storeSifting'])->name('production.sifting');
    Route::patch('production/{batch}/mixing', [BatchController::class, 'storeMixing'])->name('production.mixing');
    Route::patch('production/{batch}/attachment', [BatchController::class, 'storeAttachment'])->name('production.attachment');
    Route::patch('production/{batch}/finish', [BatchController::class, 'finish'])->name('production.finish');
});
